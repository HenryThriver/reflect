# feat: Direct Stripe Checkout from Complete Page

## Overview

Replace the interstitial pricing page with direct Stripe checkout when users click "Save to Vault" on the review complete page. Users who have already expressed intent to pay ($5/mo button) should go straight to payment, not a sales page.

**Current Flow:**
```
Complete Page → Click "Save to Vault" → Pricing Page → Click Subscribe → Stripe Checkout
```

**New Flow:**
```
Complete Page → Click "Save to Vault" → Stripe Checkout (with monthly/yearly toggle)
```

## Problem Statement

When a user clicks "Save to Vault - $5/mo" on the complete page, they've already made a decision to pay. Sending them to a pricing page with a "Free" option creates unnecessary friction and may cause drop-off. The checkout should be immediate and direct.

## Proposed Solution

1. **Update the complete page button** to go directly to Stripe Checkout
2. **Modify `checkoutWithStripe()` server action** to accept a price interval parameter
3. **Use Stripe's subscription upsells** to show monthly/yearly toggle in checkout
4. **Add `STRIPE_PRICE_YEARLY` environment variable** for the annual option
5. **Update redirect URLs** to return to complete page (not pricing) on cancel

## Technical Approach

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/stripe/actions.ts` | Add `interval` parameter, update success/cancel URLs |
| `src/lib/env.ts` | Add `STRIPE_PRICE_YEARLY` to required vars |
| `src/app/(public)/review/[templateSlug]/complete/page.tsx` | Update form to pass interval, improve button UX |
| `.env.example` | Document `STRIPE_PRICE_YEARLY` |
| `.env.local` | Add actual `STRIPE_PRICE_YEARLY` value |

### Implementation Details

#### 1. Update Server Action (`src/lib/stripe/actions.ts`)

```typescript
// Current (line ~47):
line_items: [{ price: process.env.STRIPE_PRICE_MONTHLY, quantity: 1 }],

// New:
export async function checkoutWithStripe(formData: FormData) {
  const interval = formData.get('interval') as 'monthly' | 'yearly' | null
  const priceId = interval === 'yearly'
    ? process.env.STRIPE_PRICE_YEARLY
    : process.env.STRIPE_PRICE_MONTHLY

  // ... existing auth/subscription checks ...

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?subscription=success`,
    cancel_url: `${appUrl}/review/${templateSlug}/complete?checkout=cancelled`, // Return to complete page
    metadata: { user_id: user.id },
  })
}
```

#### 2. Add Environment Variable (`src/lib/env.ts`)

```typescript
// Line 8 - add to requiredServerEnvVars:
const requiredServerEnvVars = [
  'STRIPE_PRICE_MONTHLY',
  'STRIPE_PRICE_YEARLY', // Add this
  // ... rest
]
```

#### 3. Update Complete Page Form

```typescript
// src/app/(public)/review/[templateSlug]/complete/page.tsx
// Replace single button with pricing toggle

'use client'
import { useState } from 'react'

function VaultCheckoutForm() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <form action={async (formData) => {
      setIsLoading(true)
      await checkoutWithStripe(formData)
    }}>
      <input type="hidden" name="interval" value={interval} />

      {/* Pricing Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setInterval('monthly')}
          className={interval === 'monthly' ? 'bg-primary' : 'bg-muted'}
        >
          $5/month
        </button>
        <button
          type="button"
          onClick={() => setInterval('yearly')}
          className={interval === 'yearly' ? 'bg-primary' : 'bg-muted'}
        >
          $50/year <span className="text-green-500">save $10</span>
        </button>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : `Save to Vault — ${interval === 'monthly' ? '$5/mo' : '$50/yr'}`}
      </Button>
    </form>
  )
}
```

### Stripe Dashboard Setup

Before deploying, configure subscription upsells in Stripe:

1. Go to **Product catalog** → Select your Vault product
2. Select the **monthly price** ($5/month)
3. In **Upsells** section, add the yearly price ($50/year)
4. This enables the toggle automatically in Stripe Checkout UI

### Edge Cases to Handle

| Scenario | Behavior |
|----------|----------|
| Unauthenticated user | Redirect to `/login?redirectTo=/review/{slug}/complete&checkout=pending` |
| Already subscribed | Redirect to `/dashboard` with toast "You're already subscribed!" |
| Checkout cancelled | Return to complete page with message |
| Missing `STRIPE_PRICE_YEARLY` | Throw clear error at build time (env validation) |

## Acceptance Criteria

- [ ] Clicking "Save to Vault" on complete page goes directly to Stripe Checkout
- [ ] Stripe Checkout shows monthly/yearly toggle (via Stripe's upsells feature)
- [ ] Monthly price is $5, yearly price is $50 (save $10)
- [ ] Unauthenticated users are redirected to login, then back to complete page
- [ ] Users with active subscriptions see appropriate messaging
- [ ] Cancel URL returns to complete page (not pricing page)
- [ ] Success URL goes to dashboard with success message
- [ ] Loading state prevents double-clicks on submit button
- [ ] `STRIPE_PRICE_YEARLY` environment variable is documented and validated

## Out of Scope

- Deleting the pricing page (keep it for SEO/marketing)
- Redesigning the complete page layout
- Adding promo codes or trials
- Subscription upgrade/downgrade flows

## Environment Variables

```bash
# .env.local - Add this:
STRIPE_PRICE_YEARLY=price_xxx  # Get from Stripe Dashboard

# Existing:
STRIPE_PRICE_MONTHLY=price_xxx
```

## Testing Checklist

- [ ] Test with Stripe test mode cards (`4242 4242 4242 4242`)
- [ ] Test monthly selection → checkout → webhook → subscription created
- [ ] Test yearly selection → checkout → webhook → subscription created
- [ ] Test unauthenticated flow → login → return to complete → checkout
- [ ] Test already-subscribed user → redirect to dashboard
- [ ] Test checkout cancellation → return to complete page
- [ ] Verify webhook handles both price IDs correctly

## References

- Current complete page: `src/app/(public)/review/[templateSlug]/complete/page.tsx:113-118`
- Server action: `src/lib/stripe/actions.ts:17-76`
- Webhook (already handles any price): `src/app/api/stripe/webhook/route.ts`
- Stripe Subscription Upsells: https://docs.stripe.com/payments/checkout/upsells
- Stripe Checkout Sessions API: https://docs.stripe.com/api/checkout/sessions
