# feat: Add Stripe Subscription Flow on Completion Page

## Overview

Implement a streamlined Stripe subscription flow on the review completion page, allowing users to sign up for a $5/month subscription to save their annual reviews to the cloud vault.

## Problem Statement

Currently, when users complete a review as guests:
1. Their data is stored only in localStorage (temporary, device-specific)
2. They see a "Save to Vault - $5/mo" button that redirects to `/pricing`
3. After payment via Payment Links, the user journey is fragmented
4. Risk of orphaned subscriptions if users create accounts with different emails

**Key Issue**: Guest users can pay but may never access their subscription due to email mismatch or not creating an account.

## Proposed Solution

Implement a **before-payment authentication requirement** using **server actions** (Next.js 15 pattern):

1. Guest completes review → Sees upgrade CTA on completion page
2. Clicks "Save to Vault" → Server action checks auth, redirects to login if needed
3. After authentication → Server action creates Stripe Checkout session and redirects
4. After payment → Returns to `/dashboard`
5. Dashboard migrates guest data (existing functionality)

---

## Review Feedback Applied

This plan was reviewed by DHH, Kieran, and Code Simplicity reviewers. Key changes:

### From DHH Review
- **Use server actions instead of API routes** - Next.js 15 pattern, no fetch() calls needed
- **Remove email pagination from webhook** - Since we require auth, we always have `metadata.user_id`
- **Don't over-engineer** - This is a ~60 line change, not a multi-phase project

### From Kieran Review
- **Add Customer Portal** - Users need to cancel/manage subscriptions (Phase 1, not future)
- **Never trust client-provided priceId** - Hardcode server-side
- **Add proper error handling** - try-catch around Stripe operations

### From Simplicity Review
- **Remove template slug tracking** - Not needed for the flow
- **Remove canceled state handling** - Users who cancel know they canceled
- **Skip custom success banner** - Dashboard showing reviews IS the success state

---

## Reference Implementation

Based on Vercel's canonical example: **[nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments)**

Key patterns adopted:
- Server utility functions for checkout (`checkoutWithStripe`)
- Auth check before payment (redirect to `/signin` if not authed)
- `metadata.user_id` in checkout session for reliable webhook matching
- Customer Portal as first-class feature
- Structured error handling with redirects

Key patterns NOT adopted (not needed for our use case):
- Products/Prices sync from Stripe (we have one fixed price)
- Separate customers table (our subscriptions table has stripe_customer_id)
- Trial period handling
- Multiple pricing intervals

---

## Technical Approach

### Architecture (Simplified)

```
┌─────────────────────┐
│  Completion Page    │
│  Button calls       │
│  server action      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Server Action      │
│  checkoutWithStripe │
│  - Check auth       │
│  - Check sub status │
│  - Create session   │
│  - Redirect         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Stripe Checkout    │
│  (Hosted Page)      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  /dashboard         │
│  (guest data        │
│   migrates on load) │
└─────────────────────┘
```

### Implementation

#### File 1: Server Actions for Stripe
`src/lib/stripe/actions.ts` (~45 lines)

```typescript
'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function checkoutWithStripe() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/pricing')
  }

  // Check existing subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (sub?.status === 'active') {
    redirect('/dashboard')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email!,
      line_items: [{ price: process.env.STRIPE_PRICE_MONTHLY!, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
    })

    redirect(session.url!)
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    redirect('/pricing?error=checkout_failed')
  }
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!sub?.stripe_customer_id) redirect('/pricing')

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  redirect(session.url)
}
```

#### File 2: Update Completion Page Button
Add form with server action (~5 lines change)

```typescript
import { checkoutWithStripe } from '@/lib/stripe/actions'

// In the component:
<form action={checkoutWithStripe}>
  <Button type="submit">Save to Vault — $5/month</Button>
</form>
```

#### File 3: Simplify Webhook
Remove email pagination fallback, require `metadata.user_id` (~10 lines change)

```typescript
case 'checkout.session.completed': {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('Missing user_id in checkout metadata - skipping')
    break
  }
  // Direct upsert with userId - no email lookup needed
}
```

#### File 4: Add Portal to Dashboard
For subscribed users (~5 lines)

```typescript
import { createPortalSession } from '@/lib/stripe/actions'

{isSubscribed && (
  <form action={createPortalSession}>
    <Button variant="outline">Manage Subscription</Button>
  </form>
)}
```

#### File 5: Environment Variable
Add to `.env.local` and Vercel:

```env
STRIPE_PRICE_MONTHLY=price_xxx  # Server-only, no NEXT_PUBLIC_ needed
```

### Total Implementation
- ~45 lines in `actions.ts` (server actions)
- ~5 lines in completion page (form with button)
- ~10 lines webhook simplification
- ~5 lines dashboard portal button
- **~65 lines total**

---

## Acceptance Criteria

- [ ] Guest users clicking "Save to Vault" are redirected to login
- [ ] After login, users are redirected to Stripe Checkout
- [ ] After payment, users land on dashboard
- [ ] Guest review data migrates automatically (existing functionality)
- [ ] Subscribed users can access Customer Portal from dashboard
- [ ] Webhook processes checkout.session.completed with metadata.user_id
- [ ] No priceId exposed to or accepted from client

---

## Files to Create/Modify

### New Files
- `src/lib/stripe/actions.ts` - Server actions for checkout and portal

### Modified Files
- `src/app/(public)/review/[templateSlug]/complete/page.tsx` - Add checkout form
- `src/app/(dashboard)/dashboard/page.tsx` - Add portal button
- `src/app/api/stripe/webhook/route.ts` - Simplify to require metadata.user_id
- `.env.example` - Add STRIPE_PRICE_MONTHLY

---

## References

### Canonical Example
- **Vercel Template**: https://github.com/vercel/nextjs-subscription-payments (archived, superseded by https://github.com/nextjs/saas-starter)
- Key files referenced:
  - `utils/stripe/server.ts` - Checkout session creation pattern
  - `utils/supabase/admin.ts` - Customer management pattern
  - `app/api/webhooks/route.ts` - Webhook handling pattern
  - `components/ui/Pricing/Pricing.tsx` - Client-side checkout flow

### Documentation
- [Stripe Checkout](https://docs.stripe.com/payments/checkout)
- [Stripe Customer Portal](https://docs.stripe.com/customer-management)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

*Plan created: 2025-12-17*
*Updated after review: 2025-12-17*
