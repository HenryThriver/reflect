# feat: Send welcome emails via Resend after user signup

## Overview

Implement automated welcome emails sent via Resend when users create an account through either email/password signup or Google OAuth. The email will be triggered reliably for all new users and provide a personalized onboarding experience.

## Problem Statement / Motivation

Currently, users who sign up receive no welcome communication beyond Supabase's built-in email confirmation (for email/password signups). This creates a missed opportunity to:

- Establish brand connection immediately after signup
- Guide new users to key features
- Set expectations for the product experience
- Provide support/contact information early

Google OAuth users receive no email at all since their email is pre-verified.

## Proposed Solution

Use the **OAuth callback convergence pattern** - trigger welcome emails from the `/auth/callback` route where both email/password and Google OAuth flows converge after successful authentication. This approach is:

- **Reliable**: Server-side execution, doesn't depend on client behavior
- **Unified**: Single trigger point for all auth methods
- **Simple**: No database webhooks or Edge Functions needed
- **Aligned with existing patterns**: Similar to how Stripe webhook handles post-event actions

### Architecture

```
Email/Password Signup           Google OAuth Signup
        ↓                               ↓
  Supabase signUp()              signInWithIdToken()
        ↓                               ↓
   Email confirmation              Immediate session
        ↓                               ↓
        └───────────→ /auth/callback ←──────────┘
                           ↓
                    Check if new user
                    (created_at within 60s)
                           ↓
                    [If new] Send welcome email
                           ↓
                    Redirect to dashboard
```

## Technical Considerations

### 1. New User Detection

Distinguish new signups from returning OAuth logins by checking `created_at` timestamp:

```typescript
// In /auth/callback/route.ts
const { data: { user } } = await supabase.auth.getUser()
const createdAt = new Date(user.created_at)
const now = new Date()
const isNewUser = (now.getTime() - createdAt.getTime()) < 60000 // 60 seconds
```

### 2. Error Handling Strategy

Email failures should NOT block signup. Strategy:
- Log all email attempts and failures
- Continue user redirect regardless of email status
- Implement retry with exponential backoff (3 attempts)
- Alert on persistent failures (future monitoring)

### 3. Environment Handling

| Environment | Behavior |
|-------------|----------|
| Development | Log to console, skip actual send |
| Production | Send via Resend API |

### 4. Rate Limiting

Resend default: 2 requests/second. For signup volumes, this is sufficient. Implement exponential backoff on 429 responses.

### 5. Email Verification Interaction

Supabase sends confirmation emails for email/password signups. Welcome email is sent **immediately** regardless of verification status - it's a different purpose (onboarding vs verification).

## Acceptance Criteria

### Functional Requirements

- [ ] New email/password signup users receive welcome email after confirming their email
- [ ] New Google OAuth users receive welcome email immediately after first login
- [ ] Returning OAuth users do NOT receive welcome email on subsequent logins
- [ ] Email includes user's name (from OAuth metadata) or email fallback
- [ ] Email includes call-to-action button to dashboard

### Non-Functional Requirements

- [ ] Email sending completes within 5 seconds or times out gracefully
- [ ] Failed email sends are logged with error details
- [ ] No emails sent in development environment (console.log only)
- [ ] Build passes with no TypeScript errors

### Edge Cases

- [ ] If Resend API fails, user signup still completes
- [ ] If user created_at check fails, default to NOT sending (avoid duplicates)
- [ ] OAuth callback errors redirect to login page without sending email

## Implementation

### Files to Create

#### 1. `src/lib/email/client.ts`

```typescript
import { Resend } from 'resend'
import { getServerEnv } from '@/lib/env'

let resendClient: Resend | null = null

export function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(getServerEnv('RESEND_API_KEY'))
  }
  return resendClient
}
```

#### 2. `src/lib/email/templates/welcome-email.tsx`

```tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', margin: '40px auto' }}>
          <Section>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              Welcome to Annual Review, {name}!
            </Text>
            <Text style={{ color: '#666', lineHeight: '1.6' }}>
              You've taken the first step toward meaningful self-reflection.
              Your annual review journey starts here.
            </Text>
            <Button
              href="https://yourdomain.com/dashboard"
              style={{
                backgroundColor: '#000',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '16px',
              }}
            >
              Start Your Review
            </Button>
          </Section>
          <Hr style={{ margin: '32px 0', borderColor: '#eee' }} />
          <Text style={{ color: '#999', fontSize: '12px' }}>
            Questions? Reply to this email or contact support@yourdomain.com
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

#### 3. `src/lib/email/send-welcome.ts`

```typescript
'use server'

import { getResend } from './client'
import { WelcomeEmail } from './templates/welcome-email'

interface SendWelcomeEmailParams {
  email: string
  name: string
}

export async function sendWelcomeEmail({ email, name }: SendWelcomeEmailParams) {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Email] Would send welcome email to:', email, 'name:', name)
    return { success: true, data: { id: 'dev-mock-id' } }
  }

  const resend = getResend()

  // Retry with exponential backoff
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Annual Review <hello@yourdomain.com>',
        to: [email],
        subject: 'Welcome to Annual Review!',
        react: WelcomeEmail({ name }),
      })

      if (error) {
        lastError = new Error(error.message)

        // Rate limit - wait and retry
        if (error.message.includes('rate limit')) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
          continue
        }

        throw lastError
      }

      return { success: true, data }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error')

      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
      }
    }
  }

  console.error('[Email] Failed to send welcome email after retries:', lastError)
  return { success: false, error: lastError?.message }
}
```

### Files to Modify

#### 4. `src/lib/env.ts`

Add `RESEND_API_KEY` to required server vars:

```typescript
const requiredServerEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_MONTHLY',
  'RESEND_API_KEY', // Add this
] as const
```

#### 5. `src/app/auth/callback/route.ts`

Add welcome email trigger after session exchange:

```typescript
import { sendWelcomeEmail } from '@/lib/email/send-welcome'

// After successful session exchange...
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  // Check if this is a new user (created within last 60 seconds)
  const createdAt = new Date(user.created_at)
  const now = new Date()
  const isNewUser = (now.getTime() - createdAt.getTime()) < 60000

  if (isNewUser) {
    // Extract name from user metadata or use email fallback
    const name = user.user_metadata?.full_name ||
                 user.user_metadata?.name ||
                 user.email?.split('@')[0] ||
                 'there'

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ email: user.email!, name }).catch(err => {
      console.error('[Auth Callback] Welcome email error:', err)
    })
  }
}
```

## Dependencies

### New Packages

```bash
npm install resend react-email @react-email/components
```

### Environment Variables

Add to `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxx
```

Add to `.env.example`:

```bash
# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
```

## Success Metrics

- 100% of new signups receive welcome email (measurable via Resend dashboard)
- Zero duplicate emails sent to returning OAuth users
- Email delivery rate > 95% (check Resend analytics)
- No increase in signup error rates

## Dependencies & Risks

### Dependencies

| Dependency | Status | Risk |
|------------|--------|------|
| Resend account | Need to set up | Low |
| Domain verification in Resend | Need to configure | Medium - affects deliverability |
| `RESEND_API_KEY` env var | Need to add | Low |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Resend API down during signup | Low | Medium | Non-blocking send, graceful failure |
| Rate limit exceeded | Low | Low | Exponential backoff retry |
| Wrong `created_at` detection | Low | Medium | Conservative 60s window |
| Domain not verified | Medium | High | Verify domain before deploying |

## Future Considerations

- **Email tracking table**: Add database logging for email attempts/failures
- **Resend webhooks**: Track delivery/bounce events for analytics
- **Email templates**: Add more emails (onboarding series, reminders)
- **Preferences**: User email preference settings
- **A/B testing**: Test different welcome email copy

## References & Research

### Internal References

- Auth callback handler: `src/app/auth/callback/route.ts`
- Environment validation: `src/lib/env.ts`
- Stripe webhook pattern (similar idempotency): `src/app/api/stripe/webhook/route.ts`
- Google OAuth signin: `src/components/auth/google-signin-button.tsx`
- Email/password signup: `src/app/(auth)/signup/page.tsx`

### External References

- [Resend Next.js Integration](https://resend.com/nextjs)
- [Resend with Next.js App Router](https://resend.com/docs/send-with-nextjs)
- [React Email Documentation](https://react.email/)
- [Supabase Auth Hooks Overview](https://supabase.com/docs/guides/auth/auth-hooks)

### Related Work

- Stripe webhook handler already demonstrates webhook pattern: `src/app/api/stripe/webhook/route.ts`
- User metadata access patterns from Google OAuth: `src/components/auth/google-signin-button.tsx`
