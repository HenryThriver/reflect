'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getSafeRedirect } from '@/lib/redirect-validation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorAlert } from '@/components/ui/error-alert'
import { DividerWithText } from '@/components/ui/divider-with-text'
import { GoogleIcon } from '@/components/icons/google-icon'
import { useOAuthLogin } from '@/hooks/use-oauth-login'
import { GoogleOneTap } from '@/components/auth/google-one-tap'
import { GoogleSignInButton } from '@/components/auth/google-signin-button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirectTo'))
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(errorParam ? 'Authentication failed. Please try again.' : '')
  const [isLoading, setIsLoading] = useState(false)

  const { signInWithGoogle, isOAuthLoading, oauthError } = useOAuthLogin(redirectTo)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GoogleOneTap redirectTo={redirectTo} />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to access your vault</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorAlert message={error || oauthError} />

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <LoadingButton type="submit" className="w-full" loading={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </LoadingButton>
          </form>

          <DividerWithText>Or continue with</DividerWithText>

          {/* Official Google Sign-In button with personalization (shows your profile when signed in) */}
          <div className="flex justify-center">
            <GoogleSignInButton redirectTo={redirectTo} width={350} />
          </div>

          {/* Fallback button for when GIS doesn't load */}
          <noscript>
            <LoadingButton
              variant="outline"
              className="w-full"
              onClick={signInWithGoogle}
              loading={isOAuthLoading}
              disabled={isLoading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </LoadingButton>
          </noscript>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href={`/signup${redirectTo !== '/dashboard' ? `?redirectTo=${redirectTo}` : ''}`}
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  )
}
