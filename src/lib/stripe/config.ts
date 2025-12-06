export const STRIPE_CONFIG = {
  // These are Payment Link URLs from your Stripe Dashboard
  paymentLinks: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY!,
    yearly: process.env.NEXT_PUBLIC_STRIPE_LINK_YEARLY!,
  },
  // Customer portal link (from Stripe Dashboard > Settings > Customer Portal)
  customerPortal: process.env.NEXT_PUBLIC_STRIPE_PORTAL_LINK!,
}
