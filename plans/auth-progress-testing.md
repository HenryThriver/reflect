# feat: Test Auth & Progress Saving After Signup

## Overview

Test and ensure that user progress and answers are saved properly after signing up with Google OAuth or email/password.

## Key Findings

### Why Magic Link Isn't Appearing

**Answer**: Magic Link was **explicitly rejected** during development.

**Evidence** (`plans/login-guest-flow-henry-template.md:35,359`):
- "~~Magic Link~~ (email deliverability complexity)"
- "**Magic Link** - Email deliverability is hard. Google + Email/Password covers users."

**Decision**: Only Email/Password + Google OAuth were implemented. This is intentional.

### Current State

| Component | Status |
|-----------|--------|
| Email/Password Auth | ✅ Works |
| Google OAuth | ✅ Code exists, needs Supabase dashboard config |
| Guest → localStorage | ✅ Works |
| Authenticated → Database | ❌ **Missing** |

### The Problem

Right now, `ReviewFlow` uses `saveGuestResponse()` for ALL users - even authenticated ones. This means:
- Authenticated users save to localStorage only
- If they clear browser data or switch devices, progress is lost

---

## Solution (Simplified)

### Step 1: Verify Google OAuth Works

**Supabase Dashboard → Authentication → Providers → Google**:
- [ ] Enable Google provider is toggled ON
- [ ] Client ID and Secret from Google Cloud Console are configured
- [ ] Redirect URLs whitelisted:
  - `http://localhost:3000/auth/callback`
  - Production URL

**Test**:
```bash
npm run dev
open http://localhost:3000/signup
# Click "Continue with Google" → should redirect and return
```

### Step 2: Add Database Save/Load Functions

Add two simple functions to `src/lib/guest-storage.ts`:

```typescript
// src/lib/guest-storage.ts - ADD THESE

import { createClient } from '@/lib/supabase/client'

export async function saveAuthenticatedReview(
  userId: string,
  templateSlug: string,
  year: number,
  responses: Record<string, string>,
  currentQuestionIndex: number
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('annual_reviews').upsert({
    user_id: userId,
    template_slug: templateSlug,
    year,
    responses,
    current_question_index: currentQuestionIndex,
    status: 'draft'
  }, { onConflict: 'user_id,template_slug,year' })

  if (error) {
    console.error('Failed to save review:', error)
  }
}

export async function loadAuthenticatedReview(
  userId: string,
  templateSlug: string,
  year: number
): Promise<{ responses: Record<string, string>; currentQuestionIndex: number } | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('annual_reviews')
    .select('responses, current_question_index')
    .eq('user_id', userId)
    .eq('template_slug', templateSlug)
    .eq('year', year)
    .single()

  if (error || !data) return null

  return {
    responses: data.responses || {},
    currentQuestionIndex: data.current_question_index || 0
  }
}
```

### Step 3: Update ReviewFlow Component

Modify `src/components/review/review-flow.tsx`:

1. **Pass user object** (not just `isAuthenticated` boolean)
2. **Load from DB when authenticated**
3. **Save to DB when authenticated**

```typescript
// In ReviewFlow props
interface ReviewFlowProps {
  template: ReviewTemplate
  user?: { id: string } | null  // Changed from isAuthenticated boolean
}

// In useEffect for loading
useEffect(() => {
  async function loadReview() {
    if (user?.id) {
      // Try database first
      const dbReview = await loadAuthenticatedReview(
        user.id,
        template.slug,
        new Date().getFullYear()
      )
      if (dbReview) {
        setResponses(dbReview.responses)
        setCurrentQuestionIndex(dbReview.currentQuestionIndex)
        return
      }
    }
    // Fall back to localStorage for guests
    const guestReview = getGuestReview(template.slug)
    if (guestReview) {
      setResponses(guestReview.responses)
      setCurrentQuestionIndex(guestReview.currentQuestionIndex)
    }
  }
  loadReview()
}, [user?.id, template.slug])

// In response change handler
const handleResponseChange = (value: string) => {
  const questionId = displayQuestions[currentIndex].id
  setResponses(prev => ({ ...prev, [questionId]: value }))

  if (user?.id) {
    // Save to database
    saveAuthenticatedReview(
      user.id,
      template.slug,
      new Date().getFullYear(),
      { ...responses, [questionId]: value },
      currentIndex
    )
  } else {
    // Save to localStorage
    saveGuestResponse(template.slug, questionId, value)
  }
}
```

---

## Testing Checklist

### Google OAuth
- [ ] Click "Continue with Google" on signup → redirects to Google
- [ ] Complete Google auth → returns to app with session
- [ ] User appears in Supabase Dashboard → Authentication → Users

### Authenticated Progress Saving
- [ ] Start review as authenticated user → answer questions
- [ ] Check Supabase Dashboard → Table Editor → annual_reviews → row exists
- [ ] Close browser, reopen → progress restored from database
- [ ] Different device, same account → see same progress

### Guest Progress Saving (existing, verify still works)
- [ ] Start as guest → answers save to localStorage
- [ ] Refresh page → progress persists

---

## Acceptance Criteria

- [ ] Google OAuth works end-to-end
- [ ] Authenticated users' progress saves to `annual_reviews` table
- [ ] Authenticated users can resume from database on any device
- [ ] Guest users still work (localStorage)

---

## What We're NOT Doing (YAGNI)

These were in the original plan but removed based on review feedback:

- ❌ Debounced writes - Just save on each change, it's once a year
- ❌ Retry logic - Not needed until we see failures
- ❌ Schema additions (`review_mode`, `current_screen`, `value_forest_state`) - UI state doesn't need database persistence
- ❌ Enhanced migration - Current migration works fine for responses
- ❌ Multi-tab sync - Solve if users report issues
- ❌ Offline handling - Solve if users report issues

---

## Files to Modify

1. `src/lib/guest-storage.ts` - Add 2 functions (~25 lines)
2. `src/components/review/review-flow.tsx` - Update props and handlers (~20 lines changed)
3. Parent component(s) that render ReviewFlow - Pass `user` instead of `isAuthenticated`

---

## References

- OAuth hook: `src/hooks/use-oauth-login.ts`
- Guest storage: `src/lib/guest-storage.ts`
- Database schema: `supabase/schema.sql`
- Supabase client: `src/lib/supabase/client.ts`
