'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOAuthLogin(redirectTo: string) {
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)

  const signInWithGoogle = async () => {
    setIsOAuthLoading(true)
    setOauthError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })

    if (error) {
      setOauthError(error.message)
      setIsOAuthLoading(false)
    }
    // If successful, page will redirect
  }

  return { signInWithGoogle, isOAuthLoading, oauthError }
}
