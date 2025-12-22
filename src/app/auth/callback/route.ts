import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSafeRedirect } from '@/lib/redirect-validation'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const safeNext = getSafeRedirect(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Send welcome email to new users (non-blocking)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && !user.user_metadata?.welcome_email_sent) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'there'

        sendWelcomeEmail(user.email!, name)
          .then(async (result) => {
            if (result.success) {
              // Mark as sent to prevent duplicates
              await supabase.auth.updateUser({
                data: { welcome_email_sent: true },
              })
            }
          })
          .catch((err) =>
            console.error('[AUTH_CALLBACK] Welcome email error:', err)
          )
      }

      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
