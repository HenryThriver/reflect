# Security Audit Report: PR #10 - Stripe Subscription Checkout Flow

**Audit Date:** 2025-12-22
**Auditor:** Application Security Specialist
**PR Title:** Release: Stripe subscription checkout flow
**Branch:** feature/stripe-subscription-flow

---

## Executive Summary

**Overall Risk Assessment: LOW-MEDIUM**

This PR implements a Stripe subscription checkout flow with generally strong security practices. The code demonstrates security awareness with proper URL validation, webhook signature verification, and customer ownership checks. However, several **MEDIUM** and **LOW** severity vulnerabilities require remediation before production deployment.

### Critical Findings Summary
- **Critical:** 0
- **High:** 0
- **Medium:** 3
- **Low:** 4
- **Informational:** 3

---

## Detailed Security Findings

### MEDIUM SEVERITY VULNERABILITIES

#### M-1: Missing User ID Validation in Webhook Handler
**File:** `/Users/henryfinkelstein/Desktop/code/review/src/app/api/stripe/webhook/route.ts:122`

**Description:**
The webhook handler accepts `session.metadata?.user_id` without validating that it corresponds to a legitimate user in the database. An attacker who compromises Stripe API credentials could create checkout sessions with arbitrary user IDs, potentially creating subscriptions for non-existent users or hijacking existing user accounts.

**Vulnerable Code:**
```typescript
const userId = session.metadata?.user_id

if (!customerId || !subscriptionId || !userId) {
  console.error('checkout.session.completed: invalid or missing IDs', {
    hasCustomer: !!customerId,
    hasSubscription: !!subscriptionId,
    hasUserId: !!userId,
  })
  break
}

// Upsert subscription - use transaction-like pattern
const { error: upsertError } = await supabase
  .from('subscriptions')
  .upsert({
    user_id: userId,  // UNVALIDATED USER ID
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    // ...
  })
```

**Impact:**
- Account takeover via subscription manipulation
- Creation of orphaned subscription records
- Potential for fraudulent billing

**Exploitability:** Medium (requires Stripe API key compromise)

**Remediation:**
```typescript
// Validate that user_id exists in auth.users before upserting
const { data: userExists } = await supabase.auth.admin.getUserById(userId)

if (!userExists) {
  console.error('checkout.session.completed: invalid user_id in metadata')
  return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
}
```

---

#### M-2: No Rate Limiting on Server Actions
**File:** `/Users/henryfinkelstein/Desktop/code/review/src/lib/stripe/actions.ts:22` (checkoutWithStripe)

**Description:**
The `checkoutWithStripe` and `createPortalSession` server actions lack rate limiting. An attacker could abuse these endpoints to:
1. Generate thousands of Stripe checkout sessions (API quota exhaustion)
2. Spam the error tracking system
3. Enumerate valid email addresses via timing attacks

**Vulnerable Code:**
```typescript
export async function checkoutWithStripe(formData?: FormData): Promise<never> {
  // No rate limiting
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  // ... creates Stripe session without any throttling
}
```

**Impact:**
- Stripe API quota exhaustion
- Increased Stripe costs (session creation may have costs)
- Denial of service via resource exhaustion

**Exploitability:** High (authenticated users can spam)

**Remediation:**
Implement rate limiting using Vercel's rate-limit library or similar:
```typescript
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function checkoutWithStripe(formData?: FormData): Promise<never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { success } = await ratelimit.limit(user.id)
    if (!success) {
      redirect('/pricing?error=rate_limit')
    }
  }
  // ... rest of function
}
```

---

#### M-3: Missing Customer Metadata Validation in Webhook
**File:** `/Users/henryfinkelstein/Desktop/code/review/src/app/api/stripe/webhook/route.ts:128`

**Description:**
While `createPortalSession` correctly verifies customer ownership via metadata (line 136), the webhook handler does NOT verify that the Stripe customer's metadata matches the user_id being written to the database. This creates a potential account linking vulnerability.

**Vulnerable Code:**
```typescript
// In webhook handler - NO customer metadata validation
const userId = session.metadata?.user_id
// ... directly uses userId without verifying customer.metadata.user_id
```

**Compare to the CORRECT implementation in createPortalSession:**
```typescript
// Verify metadata MUST match current user (not optional - prevents spoofing)
if (!customer.metadata?.user_id || customer.metadata.user_id !== user.id) {
  console.error('Customer ownership mismatch or missing metadata')
  redirect('/pricing')
}
```

**Impact:**
- Subscription linking to wrong user account
- Potential for subscription theft

**Remediation:**
Add customer metadata validation in webhook:
```typescript
const customer = await stripe.customers.retrieve(customerId)

if (customer.deleted ||
    !customer.metadata?.user_id ||
    customer.metadata.user_id !== userId) {
  console.error('Customer ownership mismatch in webhook')
  break
}
```

---

### LOW SEVERITY VULNERABILITIES

#### L-1: Overly Permissive URL Validation
**File:** `/Users/henryfinkelstein/Desktop/code/review/src/lib/stripe/actions.ts:12-17`

**Description:**
The `validateReturnUrl` function only checks if URL starts with `/` but doesn't validate against a whitelist of allowed paths. While it correctly prevents open redirects, it allows redirection to ANY path in the application, including potential admin/internal routes.

**Vulnerable Code:**
```typescript
function validateReturnUrl(url: string | null): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return '/pricing'
  }
  return url  // Allows ANY path: /admin, /internal, etc.
}
```

**Impact:**
- Potential for phishing attacks via trusted domain redirects
- User confusion if redirected to unexpected internal pages

**Remediation:**
```typescript
const ALLOWED_RETURN_PATHS = ['/pricing', '/dashboard', '/review', '/templates']

function validateReturnUrl(url: string | null): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return '/pricing'
  }

  // Check against whitelist
  const allowed = ALLOWED_RETURN_PATHS.some(path => url.startsWith(path))
  if (!allowed) {
    console.warn(`Rejected returnTo path: ${url}`)
    return '/pricing'
  }

  return url
}
```

---

#### L-2: Sensitive Information Disclosure in Error Messages
**File:** `/Users/henryfinkelstein/Desktop/code/review/src/app/(public)/review/[templateSlug]/complete/page.tsx:29-34`

**Description:**
Error messages returned to the client are generic (good), but the server logs may contain sensitive information that could be exposed via error tracking services.

**Vulnerable Code:**
```typescript
if (subError) {
  console.error('Failed to check subscription status:', subError.message)
  redirect(`${cancelUrl}?error=database_error`)
}
```

**Impact:**
- Database error messages may leak schema information
- Error tracking services may capture sensitive data

**Remediation:**
Sanitize error messages before logging:
```typescript
if (subError) {
  console.error('Failed to check subscription status', {
    code: subError.code,
    // Don't log full message which might contain sensitive data
  })
  redirect(`${cancelUrl}?error=database_error`)
}
```

---

#### L-3: No HTTPS Enforcement Validation
**File:** `/Users/henryfinkelstein/Desktop/code/review/src/lib/stripe/actions.ts:54, 124`

**Description:**
The code uses `NEXT_PUBLIC_APP_URL` for constructing callback URLs but doesn't verify it uses HTTPS in production. HTTP callbacks would expose session tokens.

**Vulnerable Code:**
```typescript
const appUrl = getPublicEnv('NEXT_PUBLIC_APP_URL')
// ... later
success_url: `${appUrl}/dashboard?subscription=success`,
cancel_url: `${appUrl}${cancelUrl}`,
```

**Impact:**
- Session token exposure if HTTPS not enforced
- Man-in-the-middle attacks on callback URLs

**Remediation:**
```typescript
const appUrl = getPublicEnv('NEXT_PUBLIC_APP_URL')

if (process.env.NODE_ENV === 'production' && !appUrl.startsWith('https://')) {
  throw new Error('NEXT_PUBLIC_APP_URL must use HTTPS in production')
}
```

---

#### L-4: Missing Stripe API Version Pinning
**File:** `/Users/henryfinkelstein/Desktop/code/review/src/lib/stripe/client.ts:12`

**Description:**
The Stripe client doesn't specify an API version, which means it will use the account's default version. This could lead to breaking changes if Stripe's API is upgraded.

**Vulnerable Code:**
```typescript
stripeInstance = new Stripe(getServerEnv('STRIPE_SECRET_KEY'))
```

**Impact:**
- Unexpected behavior if Stripe updates API
- Security fixes may be missed

**Remediation:**
```typescript
stripeInstance = new Stripe(getServerEnv('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia', // Pin to specific version
})
```

---

### INFORMATIONAL FINDINGS

#### I-1: No CSRF Protection Mentioned for Server Actions
**Status:** Likely Protected

Next.js 14+ Server Actions include built-in CSRF protection via origin checking, but this should be documented and verified. The form submission pattern used is:

```typescript
<form action={checkoutWithStripe}>
  <input type="hidden" name="returnTo" value={`/review/${templateSlug}/complete`} />
  <Button type="submit">Save to Vault</Button>
</form>
```

**Recommendation:** Verify Next.js CSRF protection is active and document this security control.

---

#### I-2: Environment Variable Security
**Status:** Good

Environment variables are properly validated and trimmed:
```typescript
export function getServerEnv(key: ServerEnvVar): string {
  const value = process.env[key]?.trim()  // Prevents whitespace issues
  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}`)
  }
  return value
}
```

No hardcoded secrets detected in codebase. `.env.example` properly uses placeholder values.

---

#### I-3: SQL Injection Protection
**Status:** Protected

All database queries use Supabase's query builder with parameterized queries:
```typescript
await supabase
  .from('subscriptions')
  .select('status')
  .eq('user_id', user.id)  // Parameterized
```

No raw SQL string concatenation detected.

---

## Security Controls Implemented (Positive Findings)

### 1. Webhook Signature Verification
**File:** `webhook/route.ts:75-79`

```typescript
event = stripe.webhooks.constructEvent(
  body,
  sig,
  getServerEnv('STRIPE_WEBHOOK_SECRET')
)
```
Properly validates webhook signatures before processing events.

---

### 2. Open Redirect Prevention
**File:** `actions.ts:12-17`

```typescript
function validateReturnUrl(url: string | null): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return '/pricing'
  }
  return url
}
```
Prevents open redirect attacks (though could be more restrictive - see L-1).

---

### 3. Customer Ownership Verification
**File:** `actions.ts:128-139`

```typescript
const customer = await stripe.customers.retrieve(sub.stripe_customer_id)

if (customer.deleted) {
  redirect('/pricing')
}

if (!customer.metadata?.user_id || customer.metadata.user_id !== user.id) {
  console.error('Customer ownership mismatch or missing metadata')
  redirect('/pricing')
}
```
Strong verification prevents portal session hijacking.

---

### 4. Stripe ID Validation
**File:** `webhook/route.ts:15-20`

```typescript
function validateStripeId(id: unknown, prefix: string): string | null {
  if (typeof id !== 'string') return null
  if (!id.startsWith(prefix)) return null
  if (!/^[a-zA-Z0-9_]+$/.test(id)) return null
  return id
}
```
Prevents injection of malformed Stripe IDs.

---

### 5. Webhook Idempotency
**File:** `webhook/route.ts:89-98`

```typescript
const { data: existing } = await supabase
  .from('webhook_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .maybeSingle()

if (existing) {
  console.log(`Event ${event.id} already processed, skipping`)
  return NextResponse.json({ received: true, skipped: 'duplicate' })
}
```
Prevents duplicate webhook processing and race conditions.

---

### 6. Row-Level Security (RLS) Policies
**File:** `supabase/migrations/20251203000000_subscription_rls_policies.sql`

```sql
CREATE POLICY "Prevent client subscription inserts"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (false);
```
Prevents client-side writes to subscriptions table - only service role (webhook) can write.

---

## OWASP Top 10 Compliance Checklist

| OWASP Category | Status | Notes |
|----------------|--------|-------|
| A01:2021 - Broken Access Control | PARTIAL | Customer ownership verified in portal, but webhook lacks user validation (M-1) |
| A02:2021 - Cryptographic Failures | PASS | HTTPS assumed, webhook signatures verified, no sensitive data in URLs |
| A03:2021 - Injection | PASS | Parameterized queries used throughout, Stripe ID validation implemented |
| A04:2021 - Insecure Design | PARTIAL | No rate limiting (M-2), no user enumeration protection |
| A05:2021 - Security Misconfiguration | PARTIAL | Missing API version pinning (L-4), no HTTPS validation (L-3) |
| A06:2021 - Vulnerable Components | PASS | Using official Stripe SDK, dependencies should be audited separately |
| A07:2021 - Authentication Failures | PASS | Proper Supabase auth.getUser() usage, session-based authentication |
| A08:2021 - Software/Data Integrity | PASS | Webhook signatures verified, idempotency implemented |
| A09:2021 - Logging Failures | PARTIAL | Error logging present but may leak sensitive data (L-2) |
| A10:2021 - Server-Side Request Forgery | PASS | No user-controlled URLs in server requests |

---

## Risk Matrix

### By Severity
```
CRITICAL:    0 findings
HIGH:        0 findings
MEDIUM:      3 findings (M-1, M-2, M-3)
LOW:         4 findings (L-1, L-2, L-3, L-4)
INFO:        3 findings (I-1, I-2, I-3)
```

### By Category
```
Authentication/Authorization:  2 (M-1, M-3)
Rate Limiting:                 1 (M-2)
Input Validation:              1 (L-1)
Information Disclosure:        1 (L-2)
Configuration:                 2 (L-3, L-4)
Informational:                 3 (I-1, I-2, I-3)
```

---

## Remediation Roadmap

### Phase 1: MUST FIX (Before Production)
**Timeline: 1-2 days**

1. **M-1:** Add user ID validation in webhook handler
   - Verify user exists in database before upserting subscription
   - Add test cases for invalid user IDs

2. **M-2:** Implement rate limiting on server actions
   - Use Vercel rate-limit or Upstash Redis
   - Set limits: 10 requests/minute per user

3. **M-3:** Add customer metadata validation in webhook
   - Fetch customer from Stripe and verify metadata.user_id
   - Mirror the validation pattern from createPortalSession

### Phase 2: SHOULD FIX (Before Public Launch)
**Timeline: 3-5 days**

4. **L-1:** Implement path whitelist for returnTo URLs
   - Define allowed paths array
   - Add validation against whitelist

5. **L-3:** Add HTTPS enforcement check
   - Validate NEXT_PUBLIC_APP_URL uses HTTPS in production
   - Add startup validation

### Phase 3: NICE TO HAVE (Post-Launch)
**Timeline: 1 week**

6. **L-2:** Sanitize error messages in logs
   - Remove sensitive data from error logs
   - Implement structured logging

7. **L-4:** Pin Stripe API version
   - Choose stable API version
   - Document version upgrade process

8. **I-1:** Document CSRF protection
   - Verify Next.js Server Actions CSRF protection
   - Add security documentation

---

## Testing Recommendations

### Security Test Cases

1. **Open Redirect Testing**
   ```
   POST /checkout
   returnTo=//evil.com        → should redirect to /pricing
   returnTo=/admin            → should redirect to /pricing (with L-1 fix)
   ```

2. **Webhook Replay Attack**
   ```
   Send same webhook twice with same stripe_event_id
   → Second request should return "duplicate" and not modify DB
   ```

3. **Customer Ownership Bypass**
   ```
   Create checkout session with user_id=victim
   → Should be rejected after M-1 fix
   ```

4. **Rate Limit Testing**
   ```
   Submit 20 checkout requests in 1 minute
   → Should be rate limited after M-2 fix
   ```

---

## Conclusion

This PR demonstrates **strong security fundamentals** with proper webhook signature verification, customer ownership checks, and SQL injection prevention. However, the **MEDIUM** severity findings (M-1, M-2, M-3) represent genuine security risks that should be addressed before production deployment.

The most critical issue is the missing user ID validation in the webhook handler (M-1), which could allow account takeover if Stripe API keys are compromised. Combined with the lack of rate limiting (M-2), this creates a vulnerable attack surface.

**RECOMMENDATION: Block PR merge until M-1, M-2, and M-3 are resolved.**

After remediation, this implementation will represent a secure Stripe integration following industry best practices.

---

**Auditor Notes:**
- Code demonstrates security awareness (customer ownership verification, URL validation)
- No hardcoded secrets detected
- RLS policies properly implemented
- Webhook signature verification correctly implemented
- Main gaps: input validation, rate limiting, and defensive programming

**Follow-up Required:**
- Penetration testing after M-1, M-2, M-3 fixes
- Dependency audit (npm audit)
- Review Stripe dashboard configuration (webhook endpoints, API keys rotation)
