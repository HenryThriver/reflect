'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getSafeRedirect } from '@/lib/redirect-validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorAlert } from '@/components/ui/error-alert'
import { DividerWithText } from '@/components/ui/divider-with-text'
import { GoogleIcon } from '@/components/icons/google-icon'
import { useOAuthLogin } from '@/hooks/use-oauth-login'
import { GoogleOneTap } from '@/components/auth/google-one-tap'
import { GoogleSignInButton } from '@/components/auth/google-signin-button'

function SignupForm() {
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirectTo'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { signInWithGoogle, isOAuthLoading, oauthError } = useOAuthLogin(redirectTo)

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter'
    if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter'
    if (!/[0-9]/.test(pwd)) return 'Password must contain a number'
    return null
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in your email to confirm your account and access
              your vault.
            </p>
            <Button variant="outline" asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GoogleOneTap redirectTo={redirectTo} />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start your journey with Annual Review Vault
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorAlert message={error || oauthError} />

          <form onSubmit={handleSignup} className="space-y-4">
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
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                8+ characters with uppercase, lowercase, and number
              </p>
            </div>
            <LoadingButton type="submit" className="w-full" loading={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </LoadingButton>
          </form>

          <DividerWithText>Or continue with</DividerWithText>

          {/* Official Google Sign-In button with personalization */}
          <div className="flex justify-center">
            <GoogleSignInButton redirectTo={redirectTo} text="signup_with" width={350} />
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
            Already have an account?{' '}
            <Link
              href={`/login${redirectTo !== '/dashboard' ? `?redirectTo=${redirectTo}` : ''}`}
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SignupForm />
    </Suspense>
  )
}
