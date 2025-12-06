// Use fallback for build time, but log warning in development
function getStripeEnv(key: string, fallback: string): string {
  const value = process.env[key]
  if (!value) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing Stripe env var: ${key}, using fallback`)
    }
    return fallback
  }
  return value
}

export const STRIPE_CONFIG = {
  // These are Payment Link URLs from your Stripe Dashboard
  paymentLinks: {
    monthly: getStripeEnv('NEXT_PUBLIC_STRIPE_LINK_MONTHLY', '#'),
    yearly: getStripeEnv('NEXT_PUBLIC_STRIPE_LINK_YEARLY', '#'),
  },
  // Customer portal link (from Stripe Dashboard > Settings > Customer Portal)
  customerPortal: getStripeEnv('NEXT_PUBLIC_STRIPE_PORTAL_LINK', '#'),
}
