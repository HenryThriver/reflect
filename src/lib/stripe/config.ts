// Centralized Stripe configuration with build-time fallbacks
// Provides safe defaults for development and build processes
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
  // Payment Link URLs from Stripe Dashboard
  // Used in: /src/app/(public)/pricing/page.tsx
  paymentLinks: {
    monthly: getStripeEnv('NEXT_PUBLIC_STRIPE_LINK_MONTHLY', '#'),
    yearly: getStripeEnv('NEXT_PUBLIC_STRIPE_LINK_YEARLY', '#'),
  },
  // Customer portal link (from Stripe Dashboard > Settings > Customer Portal)
  // Reserved for future account/billing management pages
  customerPortal: getStripeEnv('NEXT_PUBLIC_STRIPE_PORTAL_LINK', '#'),
}
