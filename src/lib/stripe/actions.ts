'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPublicEnv } from '@/lib/env'
import { getStripe } from '@/lib/stripe/client'

/**
 * Creates a Stripe Checkout session for the authenticated user.
 *
 * Redirects to:
 * - /login?redirectTo=/pricing&checkout=true if not authenticated
 * - /dashboard if already subscribed
 * - Stripe Checkout URL on success
 * - /pricing?error=... on failure
 */
export async function checkoutWithStripe(): Promise<never> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirectTo=/pricing&checkout=true')
  }

  if (!user.email) {
    console.error('User has no email address')
    redirect('/pricing?error=no_email')
  }

  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subError) {
    console.error('Failed to check subscription status:', subError.message)
    redirect('/pricing?error=database_error')
  }

  if (sub?.status === 'active') {
    redirect('/dashboard')
  }

  const stripe = getStripe()
  const appUrl = getPublicEnv('NEXT_PUBLIC_APP_URL')
  const priceId = process.env.STRIPE_PRICE_MONTHLY

  if (!priceId) {
    console.error('STRIPE_PRICE_MONTHLY not configured')
    redirect('/pricing?error=config_error')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?subscription=success`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
    })

    if (!session.url) {
      console.error('Stripe session created without URL')
      redirect('/pricing?error=checkout_failed')
    }

    redirect(session.url)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to create checkout session:', message)
    redirect('/pricing?error=checkout_failed')
  }
}

/**
 * Creates a Stripe Customer Portal session for subscription management.
 *
 * Redirects to:
 * - /login if not authenticated
 * - /pricing if no subscription exists
 * - Stripe Portal URL on success
 * - /dashboard?error=... on failure
 */
export async function createPortalSession(): Promise<never> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subError) {
    console.error('Failed to fetch subscription:', subError.message)
    redirect('/dashboard?error=database_error')
  }

  if (!sub?.stripe_customer_id) {
    redirect('/pricing')
  }

  const stripe = getStripe()
  const appUrl = getPublicEnv('NEXT_PUBLIC_APP_URL')

  try {
    // Verify customer ownership before creating portal session
    const customer = await stripe.customers.retrieve(sub.stripe_customer_id)

    if (customer.deleted) {
      console.error('Customer was deleted in Stripe')
      redirect('/pricing')
    }

    // Verify metadata MUST match current user (not optional - prevents spoofing)
    if (!customer.metadata?.user_id || customer.metadata.user_id !== user.id) {
      console.error('Customer ownership mismatch or missing metadata')
      redirect('/pricing')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    })

    redirect(session.url)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to create portal session:', message)
    redirect('/dashboard?error=portal_failed')
  }
}
