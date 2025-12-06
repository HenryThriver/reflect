# Code Review Findings - PR #1

**Review Date:** 2025-12-05
**PR:** Add complete guest review flow and core features
**Branch:** `feature/templates-and-flow`
**Files Changed:** 28 (+3,236 lines)
**Last Updated:** 2025-12-06

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| P1 CRITICAL | 8 | ✅ All Fixed |
| P2 HIGH | 12 | Fix before production |
| P3 MEDIUM | 15 | Technical debt |

---

## Lessons Learned & Patterns

### Security Patterns

1. **Open Redirect Prevention**
   - Always validate redirect URLs against a whitelist
   - Check for absolute URLs (`http://`, `https://`, `//`)
   - Check for path traversal (`..`)
   - Apply validation on BOTH server and client side
   ```typescript
   const ALLOWED_REDIRECTS = ['/dashboard', '/vault', '/templates']
   function isValidRedirect(path: string): boolean {
     if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) return false
     if (path.includes('..')) return false
     return ALLOWED_REDIRECTS.some(allowed => path.startsWith(allowed))
   }
   ```

2. **CSRF Protection with Server Actions**
   - Use Next.js Server Actions instead of plain form POST to API routes
   - Server Actions have built-in CSRF protection
   - Pattern: Create `src/app/actions/auth.ts` with `'use server'` directive

3. **RLS Deny Policies**
   - When a table should only be written by service role (webhooks), add explicit DENY policies
   - Prevents accidental client-side writes even if wrong key is used
   ```sql
   CREATE POLICY "Prevent client writes" ON table FOR INSERT TO authenticated WITH CHECK (false);
   ```

### Data Integrity Patterns

4. **Webhook Idempotency**
   - Always track processed webhook events in a dedicated table
   - Use Stripe event ID as unique key
   - Check before processing, record after success
   - Pattern: `webhook_events` table with `stripe_event_id UNIQUE`

5. **User Lookup in Webhooks**
   - Never fetch all users and filter in memory (O(n))
   - Use pagination with early break, or better: store user_id in Stripe metadata
   - Best practice: Pass user_id through checkout session metadata

6. **Guest-to-Authenticated Migration**
   - Always plan for data migration when users transition from guest to authenticated
   - Run migration on first authenticated page load (dashboard layout)
   - Only clear guest data after successful migration
   - Check for existing records to prevent duplicates

### localStorage Patterns

7. **Debounce with Flush on Navigation**
   - Debounced writes can lose data on navigation
   - Add `visibilitychange`, `beforeunload`, and `pagehide` listeners
   - Flush pending writes when page becomes hidden
   ```typescript
   document.addEventListener('visibilitychange', () => {
     if (document.visibilityState === 'hidden') flushStorage()
   })
   ```

8. **Graceful Quota Handling**
   - Never silently delete all data on quota exceeded
   - Remove oldest incomplete items first
   - Emit custom events for UI to handle errors
   - Keep completed work when possible

### Files Created for These Patterns

- `src/app/actions/auth.ts` - Server action pattern
- `src/lib/migrate-guest-data.ts` - Guest migration utility
- `src/components/auth/migrate-guest-data.tsx` - Migration trigger component
- `supabase/migrations/002_webhook_events.sql` - Idempotency table
- `supabase/migrations/003_subscription_rls_policies.sql` - RLS deny policies

---

## P1 CRITICAL - Must Fix Before Merge

### P1-1: Open Redirect in Login/Signup
- **Status:** [x] ✅ Fixed (2025-12-06)
- **Files:**
  - `src/app/(auth)/login/page.tsx:16,42,55`
  - `src/app/(auth)/signup/page.tsx:16,50,73`
- **Issue:** The `redirectTo` parameter is taken from `searchParams` and used in `router.push()` and OAuth redirects without validation on the client side.
- **Risk:** Phishing attacks, credential harvesting via malicious redirect URLs
- **Fix:** Add whitelist validation before using `redirectTo`:
```typescript
const ALLOWED_REDIRECTS = ['/dashboard', '/vault', '/templates', '/pricing', '/review', '/account']

function isValidRedirect(path: string): boolean {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return false
  }
  return ALLOWED_REDIRECTS.some(allowed => path.startsWith(allowed))
}

const redirectTo = isValidRedirect(searchParams.get('redirectTo') || '')
  ? searchParams.get('redirectTo')
  : '/dashboard'
```

---

### P1-2: Missing Webhook Idempotency Protection
- **Status:** [x] ✅ Fixed (2025-12-06)
- **File:** `src/app/api/stripe/webhook/route.ts`
- **Issue:** No idempotency tracking - if Stripe retries a webhook, the same event could be processed multiple times.
- **Risk:** Duplicate subscription updates, data corruption, financial discrepancies
- **Fix:** Add `webhook_events` table to track processed events:
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
```
Then check before processing:
```typescript
const { data: existingEvent } = await supabase
  .from('webhook_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .single()

if (existingEvent) {
  return NextResponse.json({ received: true }) // Already processed
}
```

---

### P1-3: Webhook User Lookup O(n) Performance
- **Status:** [x] ✅ Fixed (2025-12-06)
- **File:** `src/app/api/stripe/webhook/route.ts:86-93`
- **Issue:** Fetches ALL users from database to find one by email - O(n) lookup that won't scale.
- **Risk:** Webhook timeouts at scale (1000+ users), performance degradation
- **Current Code:**
```typescript
const { data: users } = await supabase.auth.admin.listUsers()
const user = users.users.find((u) => u.email === customerEmail)
```
- **Fix:** Use filtered query or store user_id in Stripe metadata:
```typescript
// Option 1: Filter server-side
const { data: { users } } = await supabase.auth.admin.listUsers({
  filter: `email.eq.${customerEmail}`
})
const user = users[0]

// Option 2: Store user_id in checkout session metadata
const userId = session.metadata?.user_id
const { data: user } = await supabase.auth.admin.getUserById(userId)
```

---

### P1-4: Missing CSRF Protection on Signout
- **Status:** [x] ✅ Fixed (2025-12-06)
- **File:** `src/app/(dashboard)/layout.tsx:46-51`
- **Issue:** Signout form uses POST without CSRF token validation.
- **Risk:** Forced logout attacks, session destruction
- **Fix:** Created Server Action `src/app/actions/auth.ts` with built-in CSRF protection. Dashboard layout now uses `<form action={signOut}>` instead of plain POST.

---

### P1-5: No Guest-to-Paid Migration Path
- **Status:** [x] ✅ Fixed (2025-12-06)
- **Files:** Created `src/lib/migrate-guest-data.ts` and `src/components/auth/migrate-guest-data.tsx`
- **Issue:** No code to migrate localStorage guest reviews to database when user signs up/subscribes.
- **Risk:** Users lose all progress when converting to paid - critical conversion funnel leak
- **Fix:** Created migration utility that:
  1. Checks for existing reviews to prevent duplicates
  2. Upserts guest reviews to database with proper conflict handling
  3. Only clears guest data after successful migration
  4. `MigrateGuestData` component triggers migration on dashboard mount

---

### P1-6: LocalStorage Data Loss on Quota Exceeded
- **Status:** [x] ✅ Fixed (2025-12-06)
- **File:** `src/lib/guest-storage.ts:35-39`
- **Issue:** Silently deletes ALL user data when storage quota exceeded without warning.
- **Risk:** Complete loss of user's review progress
- **Fix:** Implemented smart quota handling:
  1. Finds oldest incomplete review to remove instead of deleting everything
  2. Emits `guest-storage-quota-warning` custom event for UI handling
  3. Preserves completed work when possible
  4. Only clears all data as last resort with `guest-storage-error` event

---

### P1-7: Race Condition in Debounced localStorage Writes
- **Status:** [x] ✅ Fixed (2025-12-06)
- **File:** `src/lib/guest-storage.ts:52-69`
- **Issue:** 500ms debounce means writes can be lost if user navigates before timeout completes.
- **Risk:** Data loss during rapid navigation
- **Fix:** Added navigation-aware flush handlers:
  1. `visibilitychange` - flushes when tab becomes hidden
  2. `beforeunload` - flushes before page unload
  3. `pagehide` - flushes on page hide (Safari support)
  4. All listeners properly clean up to prevent memory leaks

---

### P1-8: Missing RLS Write Policies on Subscriptions
- **Status:** [x] ✅ Fixed (2025-12-06)
- **File:** `supabase/migrations/003_subscription_rls_policies.sql`
- **Issue:** Only SELECT policy exists - no INSERT/UPDATE/DELETE policies.
- **Risk:** Security gap if service role key accidentally used client-side
- **Fix:** Created migration with explicit DENY policies:
  1. Blocks INSERT for both `authenticated` and `anon` roles
  2. Blocks UPDATE for both roles
  3. Blocks DELETE for both roles
  4. Added comment explaining webhook writes bypass RLS via service role

---

## P2 HIGH - Fix Before Production

### P2-1: Unsafe Environment Variable Assertions
- **Status:** [ ] Not Started
- **Files:**
  - `src/lib/stripe/config.ts:4-8`
  - `src/middleware.ts:10-11`
  - `src/lib/supabase/client.ts:5-6`
  - `src/lib/supabase/server.ts:8-9`
- **Issue:** Using `!` non-null assertion on env vars bypasses runtime safety.
- **Fix:** Use the existing `getPublicEnv`/`getServerEnv` helpers from `src/lib/env.ts`.

---

### P2-2: Missing HSTS Header
- **Status:** [ ] Not Started
- **File:** `next.config.ts`
- **Issue:** No Strict-Transport-Security header configured.
- **Risk:** Man-in-the-middle attacks, protocol downgrade
- **Fix:** Add to headers array:
```typescript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains; preload'
}
```

---

### P2-3: CSP Allows unsafe-inline and unsafe-eval
- **Status:** [ ] Not Started
- **File:** `next.config.ts:26-35`
- **Issue:** `script-src 'unsafe-inline' 'unsafe-eval'` weakens XSS protection.
- **Fix:** Use nonces for inline scripts (Next.js 16 has built-in support).

---

### P2-4: Missing DELETE Policy on Annual Reviews
- **Status:** [ ] Not Started
- **File:** `supabase/schema.sql:54-68`
- **Issue:** Users cannot delete their own reviews - GDPR "right to erasure" violation.
- **Fix:**
```sql
CREATE POLICY "Users can delete their reviews"
ON annual_reviews FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

---

### P2-5: Missing UNIQUE Constraint on stripe_subscription_id
- **Status:** [ ] Not Started
- **File:** `supabase/schema.sql:9`
- **Issue:** Duplicate Stripe subscription IDs can be inserted.
- **Fix:**
```sql
ALTER TABLE subscriptions
ADD CONSTRAINT unique_stripe_subscription_id UNIQUE (stripe_subscription_id);
```

---

### P2-6: No JSONB Validation on responses Column
- **Status:** [ ] Not Started
- **File:** `supabase/schema.sql:29`
- **Issue:** `responses` JSONB field has no schema validation - can store malformed data.
- **Fix:** Add CHECK constraint:
```sql
ALTER TABLE annual_reviews
ADD CONSTRAINT valid_responses_structure
CHECK (
  jsonb_typeof(responses) = 'object' AND
  (SELECT bool_and(jsonb_typeof(value) = 'string') FROM jsonb_each(responses))
);
```

---

### P2-7: Sequential Database Queries in Dashboard
- **Status:** [ ] Not Started
- **File:** `src/app/(dashboard)/dashboard/page.tsx:25-43`
- **Issue:** 3 sequential database calls instead of parallel.
- **Fix:** Use `Promise.all()` for subscription and reviews queries after getting user.

---

### P2-8: Webhook Errors Return 200 OK
- **Status:** [ ] Not Started
- **File:** `src/app/api/stripe/webhook/route.ts`
- **Issue:** All errors logged but return 200 - Stripe won't retry failed operations.
- **Fix:** Return 500 for database errors (triggers retry), 400 for malformed data (no retry).

---

### P2-9: Missing Auth Validation in Dashboard Queries
- **Status:** [ ] Not Started
- **File:** `src/app/(dashboard)/dashboard/page.tsx:31-43`
- **Issue:** Uses `user?.id` with optional chaining - could pass undefined to query.
- **Fix:** Add explicit null check before queries:
```typescript
if (!user?.id) {
  redirect('/login')
}
```

---

### P2-10: OAuth Code Duplication
- **Status:** [ ] Not Started
- **Files:** `src/app/(auth)/login/page.tsx:46-63`, `src/app/(auth)/signup/page.tsx:64-81`
- **Issue:** ~40 lines of identical OAuth logic duplicated.
- **Fix:** Extract to shared hook `useOAuthLogin(redirectTo: string)`.

---

### P2-11: Missing Index on stripe_subscription_id
- **Status:** [ ] Not Started
- **File:** `supabase/schema.sql`
- **Issue:** Webhook updates query by `stripe_subscription_id` without index - full table scan.
- **Fix:**
```sql
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
```

---

### P2-12: CASCADE Deletes Locked Reviews
- **Status:** [ ] Not Started
- **File:** `supabase/schema.sql:23`
- **Issue:** When user deleted, all reviews (including locked historical ones) are CASCADE deleted.
- **Fix:** Archive locked reviews before deletion or use SET NULL instead of CASCADE.

---

## P3 MEDIUM - Technical Debt

### P3-1: TypeformQuestion Duplicate Local State
- **Status:** [ ] Not Started
- **File:** `src/components/review/typeform-question.tsx:36-54`
- **Issue:** `localValue` state duplicates `value` prop with unnecessary useEffect sync.
- **Fix:** Remove local state, use prop directly.

---

### P3-2: Dashboard Page Too Large (SRP Violation)
- **Status:** [ ] Not Started
- **File:** `src/app/(dashboard)/dashboard/page.tsx` (234 lines)
- **Issue:** Single component handles data fetching, business logic, and multiple UI sections.
- **Fix:** Extract to separate components: `SubscriptionBanner`, `InProgressSection`, `CompletedSection`, `NewReviewSection`.

---

### P3-3: Missing Shared ErrorAlert Component
- **Status:** [ ] Not Started
- **Files:** `login/page.tsx`, `signup/page.tsx`
- **Issue:** Identical error display code duplicated.
- **Fix:** Create `src/components/ui/error-alert.tsx`.

---

### P3-4: Missing Shared LoadingButton Component
- **Status:** [ ] Not Started
- **Files:** `login/page.tsx`, `signup/page.tsx`
- **Issue:** Loading button pattern duplicated.
- **Fix:** Create reusable `LoadingButton` component.

---

### P3-5: Google Icon Duplicated
- **Status:** [ ] Not Started
- **Files:** `login/page.tsx:134-151`, `signup/page.tsx`
- **Issue:** Same SVG icon code in both files.
- **Fix:** Create `src/components/icons/google-icon.tsx`.

---

### P3-6: Unused TemplateTheme Interface
- **Status:** [ ] Not Started
- **File:** `src/lib/templates/types.ts:40-44`
- **Issue:** `TemplateTheme` interface defined but never used.
- **Fix:** Delete interface and `theme?` field from `ReviewTemplate`.

---

### P3-7: Unused 'multiselect' QuestionType
- **Status:** [ ] Not Started
- **File:** `src/lib/templates/types.ts:25`
- **Issue:** Type includes 'multiselect' but it's not implemented.
- **Fix:** Remove from type union until implemented.

---

### P3-8: Redundant Empty State in Dashboard
- **Status:** [ ] Not Started
- **File:** `src/app/(dashboard)/dashboard/page.tsx:216-231`
- **Issue:** Empty state duplicates "Start New Review" section below it.
- **Fix:** Remove empty state card.

---

### P3-9: Unused Environment Validation Functions
- **Status:** [ ] Not Started
- **File:** `src/lib/env.ts`
- **Issue:** `validateServerEnv()` and `validatePublicEnv()` are never called.
- **Fix:** Either use them at app startup or simplify the file.

---

### P3-10: Unnecessary Stripe Config Abstraction
- **Status:** [ ] Not Started
- **File:** `src/lib/stripe/config.ts`
- **Issue:** 10-line file just wraps 3 env vars.
- **Fix:** Consider inlining where used or keep if planning expansion.

---

### P3-11: Keyboard Navigation Duplicates Component Handling
- **Status:** [ ] Not Started
- **File:** `src/app/(public)/review/[templateSlug]/page.tsx:84-99`
- **Issue:** Page handles ArrowUp/Down while component handles Enter.
- **Fix:** Consolidate keyboard handling in one place.

---

### P3-12: Boolean Naming Inconsistencies
- **Status:** [ ] Not Started
- **Files:** Various
- **Issue:** Mix of `is`, `has`, `can` prefixes and bare names like `downloaded`.
- **Fix:** Standardize: `is` for state, `has` for possession, `can` for capability.

---

### P3-13: Progress Calculation Duplicated
- **Status:** [ ] Not Started
- **Files:** `dashboard/page.tsx:54`, `progress-bar.tsx:16`
- **Issue:** Same calculation in multiple places.
- **Fix:** Create utility function `calculateProgress(current, total)`.

---

### P3-14: No beforeunload Flush for localStorage
- **Status:** [ ] Not Started
- **File:** `src/lib/guest-storage.ts`
- **Issue:** No warning before tab close if unsaved data exists.
- **Fix:** Add beforeunload event listener.

---

### P3-15: Review Page Should Split Server/Client
- **Status:** [ ] Not Started
- **File:** `src/app/(public)/review/[templateSlug]/page.tsx`
- **Issue:** Entire page is client-side when template lookup could be server-side.
- **Fix:** Server component fetches template, passes to client component for interactivity.

---

## Positive Patterns to Maintain

- No `any` types or `@ts-ignore` comments
- Clean route group organization ((auth), (dashboard), (public))
- Proper Server/Client component boundaries
- Good template registry pattern with type safety
- Security headers configured (CSP, X-Frame-Options, etc.)
- Stripe webhook signature verification implemented
- Password strength validation with clear requirements
- Environment variable typing system

---

## Review Agents Used

- kieran-typescript-reviewer
- security-sentinel
- performance-oracle
- architecture-strategist
- pattern-recognition-specialist
- code-simplicity-reviewer
- data-integrity-guardian
