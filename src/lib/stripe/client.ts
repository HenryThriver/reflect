import Stripe from 'stripe'
import { getServerEnv } from '@/lib/env'

let stripeInstance: Stripe | null = null

/**
 * Returns a singleton Stripe client instance.
 * Uses lazy initialization to avoid creating client until needed.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getServerEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-11-17.clover',
    })
  }
  return stripeInstance
}
