'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Generate a secure nonce for OneTap
async function generateNonce(): Promise<{ nonce: string; hashedNonce: string }> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const nonce = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')

  // Hash the nonce with SHA-256
  const encoder = new TextEncoder()
  const data = encoder.encode(nonce)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashedNonce = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')

  return { nonce, hashedNonce }
}

// Google Identity Services types are declared in src/types/google-identity.d.ts

interface GoogleOneTapProps {
  redirectTo?: string
}

export function GoogleOneTap({ redirectTo = '/dashboard' }: GoogleOneTapProps) {
  const router = useRouter()
  const nonceRef = useRef<string | null>(null)
  const initializedRef = useRef(false)

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
      nonce: nonceRef.current || undefined,
    })

    if (error) {
      console.error('OneTap sign-in error:', error.message)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }, [router, redirectTo])

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initializedRef.current) return

    // OneTap requires JavaScript origins to be configured in Google Cloud Console
    // Skip in development unless explicitly enabled
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) {
      // OneTap won't work on localhost unless http://localhost:3000 is added
      // to Authorized JavaScript origins in Google Cloud Console
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.warn('Google Client ID not configured for OneTap')
      return
    }

    // Capture clientId for use in async function (TypeScript narrowing)
    const googleClientId = clientId

    async function initializeOneTap() {
      const { nonce, hashedNonce } = await generateNonce()
      nonceRef.current = nonce

      // Load Google's GSI script if not already loaded
      if (!window.google) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
          if (window.google) {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleCredentialResponse,
              nonce: hashedNonce,
              use_fedcm_for_prompt: true,
            })
            window.google.accounts.id.prompt()
          }
        }
        document.head.appendChild(script)
      } else {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
        })
        window.google.accounts.id.prompt()
      }

      initializedRef.current = true
    }

    initializeOneTap()

    return () => {
      // Cancel any pending prompts on unmount
      if (window.google) {
        window.google.accounts.id.cancel()
      }
    }
  }, [handleCredentialResponse])

  // This component doesn't render anything visible
  // OneTap shows as a popup from Google
  return null
}
