import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getServerEnv, getPublicEnv } from '@/lib/env'
import { getStripe } from '@/lib/stripe/client'

function getSupabaseAdmin() {
  return createClient(
    getPublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getServerEnv('SUPABASE_SERVICE_ROLE_KEY')
  )
}

// Validate Stripe ID format - prevents malformed data from corrupting database
function validateStripeId(id: unknown, prefix: string): string | null {
  if (typeof id !== 'string') return null
  if (!id.startsWith(prefix)) return null
  if (!/^[a-zA-Z0-9_]+$/.test(id)) return null
  return id
}

// Validate timestamp is reasonable (between 2020 and 2100)
function validateTimestamp(ts: number | undefined | null): string | null {
  if (!ts) return null
  const MIN_TIMESTAMP = 1577836800 // Jan 1, 2020
  const MAX_TIMESTAMP = 4102444800 // Jan 1, 2100
  if (ts < MIN_TIMESTAMP || ts > MAX_TIMESTAMP) {
    console.error('Invalid Stripe timestamp:', ts)
    return null
  }
  return new Date(ts * 1000).toISOString()
}

// Helper to safely extract subscription data
// In Stripe v20, period dates are on subscription items
function extractSubscriptionData(subscription: Stripe.Subscription) {
  const firstItem = subscription.items?.data?.[0]
  return {
    priceId: firstItem?.price?.id ?? null,
    currentPeriodStart: validateTimestamp(firstItem?.current_period_start),
    currentPeriodEnd: validateTimestamp(firstItem?.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
  }
}

// Map Stripe status to our app status
function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): string {
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'inactive',
    incomplete_expired: 'canceled',
    trialing: 'active',
    paused: 'inactive',
  }
  return statusMap[stripeStatus] ?? 'inactive'
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  const supabase = getSupabaseAdmin()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      getServerEnv('STRIPE_WEBHOOK_SECRET')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Check if event was already processed BEFORE inserting
    // This prevents race conditions better than insert-then-check
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle()

    if (existing) {
      console.log(`Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, skipped: 'duplicate' })
    }

    // Record webhook event for idempotency
    const { error: idempotencyError } = await supabase
      .from('webhook_events')
      .insert({ stripe_event_id: event.id, event_type: event.type })

    if (idempotencyError) {
      // Could be a race condition where another process inserted between check and insert
      if (idempotencyError.code === '23505') {
        console.log(`Event ${event.id} already processed (race), skipping`)
        return NextResponse.json({ received: true, skipped: 'duplicate' })
      }
      console.error('Error recording webhook event:', idempotencyError.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Validate all required IDs
        const customerId = validateStripeId(session.customer, 'cus_')
        const subscriptionId = validateStripeId(session.subscription, 'sub_')
        const userId = session.metadata?.user_id

        if (!customerId || !subscriptionId || !userId) {
          console.error('checkout.session.completed: invalid or missing IDs', {
            hasCustomer: !!customerId,
            hasSubscription: !!subscriptionId,
            hasUserId: !!userId,
          })
          break
        }

        // Fetch subscription details for period data
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const subData = extractSubscriptionData(subscription)

        // Upsert subscription - use transaction-like pattern
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: 'active',
              price_id: subData.priceId,
              current_period_start: subData.currentPeriodStart,
              current_period_end: subData.currentPeriodEnd,
              cancel_at_period_end: subData.cancelAtPeriodEnd,
            },
            { onConflict: 'user_id' }
          )

        if (upsertError) {
          console.error('Error upserting subscription:', upsertError.message)
          // Delete the webhook event record so Stripe can retry
          const { error: deleteError } = await supabase
            .from('webhook_events')
            .delete()
            .eq('stripe_event_id', event.id)
          if (deleteError) {
            console.error('Failed to cleanup webhook event for retry:', deleteError.message)
          }
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log(`Subscription created/updated for user: ${userId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = validateStripeId(subscription.id, 'sub_')

        if (!subscriptionId) {
          console.error('subscription.updated: invalid subscription ID')
          break
        }

        const subData = extractSubscriptionData(subscription)
        const status = mapSubscriptionStatus(subscription.status)

        // Update with row count validation
        const { data: updated, error } = await supabase
          .from('subscriptions')
          .update({
            status,
            price_id: subData.priceId,
            current_period_start: subData.currentPeriodStart,
            current_period_end: subData.currentPeriodEnd,
            cancel_at_period_end: subData.cancelAtPeriodEnd,
          })
          .eq('stripe_subscription_id', subscriptionId)
          .select('id')

        if (error) {
          console.error('Error updating subscription:', error.message)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // Check if we actually updated anything
        if (!updated || updated.length === 0) {
          console.warn('subscription.updated: no matching record found', {
            subscriptionId,
            eventId: event.id,
          })
          // This could mean checkout webhook was lost - log for monitoring
        } else {
          console.log(`Subscription updated: ${subscriptionId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = validateStripeId(subscription.id, 'sub_')

        if (!subscriptionId) {
          console.error('subscription.deleted: invalid subscription ID')
          break
        }

        const { data: updated, error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscriptionId)
          .select('id')

        if (error) {
          console.error('Error canceling subscription:', error.message)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!updated || updated.length === 0) {
          console.warn('subscription.deleted: no matching record found', {
            subscriptionId,
            eventId: event.id,
          })
        } else {
          console.log(`Subscription canceled: ${subscriptionId}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // In Stripe v20, subscription is accessed via parent.subscription_details
        const subDetails = invoice.parent?.subscription_details
        const subscriptionIdRaw = typeof subDetails?.subscription === 'string'
          ? subDetails.subscription
          : subDetails?.subscription?.id

        const subscriptionId = validateStripeId(subscriptionIdRaw, 'sub_')

        if (subscriptionId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) {
            console.error('Error updating subscription to past_due:', error.message)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error processing webhook:', message)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
