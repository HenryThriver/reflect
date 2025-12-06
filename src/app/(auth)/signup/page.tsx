'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { ErrorAlert } from '@/components/ui/error-alert'
import { GoogleIcon } from '@/components/icons/google-icon'
import { useOAuthLogin } from '@/hooks/use-oauth-login'

const ALLOWED_REDIRECTS = ['/dashboard', '/vault', '/templates', '/pricing', '/review', '/account']

function isValidRedirect(path: string): boolean {
  // Reject absolute URLs
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return false
  }
  // Reject path traversal
  if (path.includes('..')) {
    return false
  }
  // Must start with allowed prefix
  return ALLOWED_REDIRECTS.some((allowed) => path.startsWith(allowed))
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirectTo') || '/dashboard'
  const redirectTo = isValidRedirect(rawRedirect) ? rawRedirect : '/dashboard'

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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
