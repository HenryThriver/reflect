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

// Validate Stripe ID format - ensures prefix matches expected type
function validateStripeId(id: unknown, prefix: string): string | null {
  if (typeof id !== 'string' || !id.startsWith(prefix)) return null
  return id
}

// Convert Stripe timestamp to ISO string
function toISOString(ts: number | undefined | null): string | null {
  return ts ? new Date(ts * 1000).toISOString() : null
}

// Helper to safely extract subscription data from Stripe v20 API
function extractSubscriptionData(subscription: Stripe.Subscription) {
  const firstItem = subscription.items?.data?.[0]
  return {
    priceId: firstItem?.price?.id ?? null,
    currentPeriodStart: toISOString(firstItem?.current_period_start),
    currentPeriodEnd: toISOString(firstItem?.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
  }
}

// Map Stripe status to app status
function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): string {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
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
    // Check for duplicate event
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true, skipped: 'duplicate' })
    }

    // Record event for idempotency
    const { error: idempotencyError } = await supabase
      .from('webhook_events')
      .insert({ stripe_event_id: event.id, event_type: event.type })

    if (idempotencyError) {
      // Race condition - another process inserted first
      if (idempotencyError.code === '23505') {
        return NextResponse.json({ received: true, skipped: 'duplicate' })
      }
      console.error('Error recording webhook event:', idempotencyError.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const customerId = validateStripeId(session.customer, 'cus_')
        const subscriptionId = validateStripeId(session.subscription, 'sub_')
        const userId = session.metadata?.user_id

        if (!customerId || !subscriptionId || !userId) {
          console.error('checkout.session.completed: missing required IDs')
          break
        }

        // Set user_id metadata on customer for ownership verification
        await stripe.customers.update(customerId, {
          metadata: { user_id: userId },
        })

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const subData = extractSubscriptionData(subscription)

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
            { onConflict: 'stripe_subscription_id' }
          )

        if (upsertError) {
          console.error('Error upserting subscription:', upsertError.message)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log(`Subscription created for user: ${userId}`)
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

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status,
            price_id: subData.priceId,
            current_period_start: subData.currentPeriodStart,
            current_period_end: subData.currentPeriodEnd,
            cancel_at_period_end: subData.cancelAtPeriodEnd,
          })
          .eq('stripe_subscription_id', subscriptionId)

        if (error) {
          console.error('Error updating subscription:', error.message)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log(`Subscription updated: ${subscriptionId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = validateStripeId(subscription.id, 'sub_')

        if (!subscriptionId) {
          console.error('subscription.deleted: invalid subscription ID')
          break
        }

        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscriptionId)

        if (error) {
          console.error('Error canceling subscription:', error.message)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log(`Subscription canceled: ${subscriptionId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // In Stripe v20+, subscription is accessed via parent.subscription_details
        const subDetails = invoice.parent?.subscription_details
        const subscriptionRaw = subDetails?.subscription
        const subscriptionId = validateStripeId(
          typeof subscriptionRaw === 'string' ? subscriptionRaw : subscriptionRaw?.id,
          'sub_'
        )

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
