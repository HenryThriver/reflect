'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Generate a secure nonce for the button flow
async function generateNonce(): Promise<{ nonce: string; hashedNonce: string }> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const nonce = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')

  const encoder = new TextEncoder()
  const data = encoder.encode(nonce)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashedNonce = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')

  return { nonce, hashedNonce }
}

// Google Identity Services types are declared in src/types/google-identity.d.ts

interface GoogleSignInButtonProps {
  redirectTo?: string
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  width?: number
}

export function GoogleSignInButton({
  redirectTo = '/dashboard',
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  width = 300,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const nonceRef = useRef<string | null>(null)
  const initializedRef = useRef(false)

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: nonceRef.current || undefined,
      })

      if (error) {
        console.error('Google sign-in error:', error.message)
        // Show error to user and redirect back to login with error
        window.location.href = `/login?error=${encodeURIComponent(error.message)}`
        return
      }

      // Use hard redirect for more reliable navigation after auth state change
      window.location.href = redirectTo
    },
    [redirectTo]
  )

  useEffect(() => {
    if (initializedRef.current || !buttonRef.current) return

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.warn('Google Client ID not configured')
      return
    }

    const googleClientId = clientId
    const buttonElement = buttonRef.current

    async function initializeButton() {
      const { nonce, hashedNonce } = await generateNonce()
      nonceRef.current = nonce

      const loadAndRender = () => {
        if (!window.google || !buttonElement) return

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
        })

        window.google.accounts.id.renderButton(buttonElement, {
          theme,
          size,
          text,
          width,
          shape: 'rectangular',
          logo_alignment: 'left',
        })
      }

      if (!window.google) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = loadAndRender
        document.head.appendChild(script)
      } else {
        loadAndRender()
      }

      initializedRef.current = true
    }

    initializeButton()

    return () => {
      if (window.google) {
        window.google.accounts.id.cancel()
      }
    }
  }, [handleCredentialResponse, theme, size, text, width])

  // Render a placeholder div that Google will populate with the button
  return <div ref={buttonRef} className="google-signin-button" />
}
