import { Resend } from 'resend'
import { getPublicEnv } from '@/lib/env'

// Initialize Resend client (optional - emails gracefully skipped if not configured)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Email configuration
const EMAIL_FROM = 'Annual Review <hello@annualreview.app>'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<SendEmailResult> {
  // Skip if Resend not configured
  if (!resend) {
    console.log('[EMAIL] Resend not configured, skipping:', { to, subject })
    return { success: true, id: 'not-configured' }
  }

  // Skip actual send in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[EMAIL]', { to, subject })
    return { success: true, id: 'dev-mock' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('[EMAIL_FAILED]', { to, subject, error })
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('[EMAIL_ERROR]', { to, subject, error })
    return { success: false, error: String(error) }
  }
}

// Welcome email template
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<SendEmailResult> {
  const appUrl = getPublicEnv('NEXT_PUBLIC_APP_URL')

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">
        Welcome to Annual Review, ${name}!
      </h1>
      <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
        You've taken the first step toward meaningful self-reflection.
        Your annual review journey starts here.
      </p>
      <a href="${appUrl}/dashboard"
         style="display: inline-block; background: #000; color: #fff;
                padding: 12px 24px; border-radius: 6px; text-decoration: none;">
        Start Your Review
      </a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="color: #999; font-size: 12px;">
        Questions? Reply to this email.
      </p>
    </div>
  `

  return sendEmail({
    to,
    subject: 'Welcome to Annual Review!',
    html,
  })
}
