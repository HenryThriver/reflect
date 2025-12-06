import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getServerEnv, getPublicEnv } from '@/lib/env'

function getStripe() {
  return new Stripe(getServerEnv('STRIPE_SECRET_KEY'))
}

function getSupabaseAdmin() {
  return createClient(
    getPublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getServerEnv('SUPABASE_SERVICE_ROLE_KEY')
  )
}

// Helper to safely extract subscription data
// In Stripe v20, period dates are on subscription items
function extractSubscriptionData(subscription: Stripe.Subscription) {
  const firstItem = subscription.items?.data?.[0]
  return {
    priceId: firstItem?.price?.id ?? null,
    currentPeriodStart: firstItem?.current_period_start
      ? new Date(firstItem.current_period_start * 1000).toISOString()
      : null,
    currentPeriodEnd: firstItem?.current_period_end
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null,
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
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Check if already processed (idempotency)
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single()

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, skipped: 'duplicate' })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerEmail = session.customer_details?.email
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!customerEmail) {
          console.error('No customer email in checkout session')
          break
        }

        // Find user by email with pagination to avoid loading all users
        let user = null
        let page = 1
        const perPage = 50

        while (!user) {
          const { data: usersPage, error: userError } = await supabase.auth.admin.listUsers({
            page,
            perPage
          })

          if (userError) {
            console.error('Error listing users:', userError)
            return NextResponse.json(
              { error: 'Database error listing users' },
              { status: 500 }
            )
          }

          if (!usersPage.users.length) break

          user = usersPage.users.find((u) => u.email === customerEmail)
          if (user) break

          page++
          if (page > 100) break // Safety limit
        }

        if (!user) {
          console.log(`No user found for email: ${customerEmail}`)
          break
        }

        // Fetch subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const subData = extractSubscriptionData(subscription)

        // Upsert subscription
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: user.id,
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
          console.error('Error upserting subscription:', upsertError)
          return NextResponse.json(
            { error: 'Database error upserting subscription' },
            { status: 500 }
          )
        }

        console.log(`Subscription created/updated for user: ${user.id}`)

        // Record processed event
        await supabase
          .from('webhook_events')
          .insert({ stripe_event_id: event.id, event_type: event.type })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
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
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription:', error)
          return NextResponse.json(
            { error: 'Database error updating subscription' },
            { status: 500 }
          )
        }

        console.log(`Subscription updated: ${subscription.id}`)

        // Record processed event
        await supabase
          .from('webhook_events')
          .insert({ stripe_event_id: event.id, event_type: event.type })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error canceling subscription:', error)
          return NextResponse.json(
            { error: 'Database error canceling subscription' },
            { status: 500 }
          )
        }

        console.log(`Subscription canceled: ${subscription.id}`)

        // Record processed event
        await supabase
          .from('webhook_events')
          .insert({ stripe_event_id: event.id, event_type: event.type })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // In Stripe v20, subscription is accessed via parent.subscription_details
        const subDetails = invoice.parent?.subscription_details
        const subscriptionId = typeof subDetails?.subscription === 'string'
          ? subDetails.subscription
          : subDetails?.subscription?.id

        if (subscriptionId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) {
            console.error('Error updating subscription to past_due:', error)
            return NextResponse.json(
              { error: 'Database error updating subscription to past_due' },
              { status: 500 }
            )
          }
        }

        // Record processed event
        await supabase
          .from('webhook_events')
          .insert({ stripe_event_id: event.id, event_type: event.type })

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Error processing webhook:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
