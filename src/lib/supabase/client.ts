import { createBrowserClient } from '@supabase/ssr'

// Note: NEXT_PUBLIC_* env vars must be accessed directly for Next.js build-time replacement
// Do not use getPublicEnv() here - it breaks client-side bundle

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey)
}
