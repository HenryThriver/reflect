import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECTS = ['/dashboard', '/vault', '/templates', '/pricing', '/review', '/account']

function isValidRedirect(path: string): boolean {
  // Reject absolute URLs (could redirect to external sites)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return false
  }
  // Reject path traversal attempts
  if (path.includes('..')) {
    return false
  }
  // Must start with an allowed prefix
  return ALLOWED_REDIRECTS.some((allowed) => path.startsWith(allowed))
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate redirect URL is internal only (prevent open redirect)
  const safeNext = isValidRedirect(next) ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
