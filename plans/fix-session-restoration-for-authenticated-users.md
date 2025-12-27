# fix: Restore session state for authenticated users on page reload

## Overview

When users reload the review page, they should resume exactly where they left off. Currently this works for **guest users** (via localStorage) but is **broken for authenticated users** - they always start at the intro screen regardless of their saved progress.

## Problem Statement

**Current behavior:**
- Guest users: Screen state IS saved to localStorage and restored on reload ✓
- Authenticated users: Always start at `intro` screen, even though `currentQuestionIndex` and `responses` are restored ✗

**Root cause:** The database stores `current_question_index` but NOT `current_screen`. When `loadAuthenticatedReview()` returns data, the code restores responses and question index but never updates `screenState` from its default value of `{ screen: 'intro' }`.

**Code location:** `src/components/review/review-flow.tsx:139-150`

```typescript
if (user?.id) {
  const dbReview = await loadAuthenticatedReview(...)
  if (dbReview) {
    setResponses(dbReview.responses)
    setCurrentIndex(dbReview.currentQuestionIndex)
    return  // ← MISSING: Screen state not restored!
  }
}
```

## Proposed Solution

**Approach:** Infer screen state from existing data rather than adding a new database column.

Since `currentQuestionIndex > 0` implies the user has completed onboarding screens (intro → housekeeping → handwriting → centering), we can safely jump to the `questions` screen. This is a minimal change that matches the existing UX pattern.

### Why not add `current_screen` to the database?

1. **Complexity**: Would require database migration, schema changes, and updating all save points
2. **Synchronization**: Adding a new field means keeping it in sync across all screen transitions
3. **Edge cases**: Value Forest has 5 sub-phases - would need additional fields or complex encoding
4. **Minimal value**: Users who have progress are almost certainly on the `questions` screen

### Implementation

**Single change in `review-flow.tsx`:**

```typescript
// Try database first for authenticated users
if (user?.id) {
  const dbReview = await loadAuthenticatedReview(
    user.id,
    template.slug,
    new Date().getFullYear()
  )
  if (dbReview) {
    setResponses(dbReview.responses)
    setCurrentIndex(dbReview.currentQuestionIndex)
    setReviewMode(dbReview.reviewMode)

    if (dbReview.currentQuestionIndex > 0 || (dbReview.responses && Object.keys(dbReview.responses).length > 0)) {
      setScreenState({ screen: 'questions' })
    }
    return
  }
}
```

**Reviewer feedback incorporated:**
- Removed unnecessary `if (dbReview.reviewMode)` guard (DHH, Simplicity)
- Inlined progress check - variable used once, condition is clear (Simplicity)
- Added null guard for `dbReview.responses` (Kieran)
- Removed redundant comment (Simplicity)

## Technical Considerations

### Why this approach is safe

1. **Onboarding is idempotent**: The housekeeping, handwriting, and centering screens don't store critical data - they're preparation/mode selection
2. **Review mode is persisted**: The database already stores `review_mode`, so user's digital/handwriting choice is preserved
3. **Question progress is accurate**: The `current_question_index` tells us exactly which question they were on
4. **Responses are preserved**: All user answers are saved in the `responses` JSONB field

### Edge cases handled

| Scenario | Behavior |
|----------|----------|
| User on intro (no progress) | `hasProgress = false`, stays on intro |
| User completed onboarding, on questions | `hasProgress = true`, jumps to questions at correct index |
| User was on Value Forest | Jumps to questions at `section5StartIndex`, enters Value Forest on next |
| User was on visualization | Jumps to questions at `visualizationQuestionIndex`, enters visualization on next |

### Edge cases NOT handled (acceptable tradeoffs)

| Scenario | Behavior | Why acceptable |
|----------|----------|----------------|
| User was on centering screen | Jumps to questions (skips centering) | Centering is optional preparation |
| User was on housekeeping | Jumps to questions (skips housekeeping) | Housekeeping is optional checklist |
| User mid-way through Value Forest | Restarts at Value Forest intro | Value Forest state is already persisted separately for guests; authenticated users can redo it |

## Acceptance Criteria

- [ ] Authenticated user with `currentQuestionIndex > 0` resumes on `questions` screen
- [ ] Authenticated user with responses but `currentQuestionIndex = 0` resumes on `questions` screen
- [ ] Authenticated user with no progress stays on `intro` screen
- [ ] Review mode (digital/handwriting) is restored from database
- [ ] Guest user behavior remains unchanged (localStorage restoration)

## Success Metrics

- Users no longer report losing their place when returning to the app
- Session restoration works identically for guests and authenticated users

## Files to Change

### `src/components/review/review-flow.tsx`

**Lines 139-150** - Add screen state restoration:

```typescript
// src/components/review/review-flow.tsx:139-150

// BEFORE:
if (user?.id) {
  const dbReview = await loadAuthenticatedReview(
    user.id,
    template.slug,
    new Date().getFullYear()
  )
  if (dbReview) {
    setResponses(dbReview.responses)
    setCurrentIndex(dbReview.currentQuestionIndex)
    return
  }
}

// AFTER:
if (user?.id) {
  const dbReview = await loadAuthenticatedReview(
    user.id,
    template.slug,
    new Date().getFullYear()
  )
  if (dbReview) {
    setResponses(dbReview.responses)
    setCurrentIndex(dbReview.currentQuestionIndex)
    setReviewMode(dbReview.reviewMode)

    if (dbReview.currentQuestionIndex > 0 || (dbReview.responses && Object.keys(dbReview.responses).length > 0)) {
      setScreenState({ screen: 'questions' })
    }
    return
  }
}
```

## Test Plan

- [ ] Fresh authenticated user sees intro screen
- [ ] Authenticated user with saved progress sees questions screen at correct index
- [ ] Authenticated user's review mode (digital/handwriting) is restored
- [ ] Guest user session restoration still works (regression test)
- [ ] Page reload mid-questions restores correct question
- [ ] Multi-device: Start on device A, continue on device B picks up progress

## Future Considerations

If we need more precise screen restoration (e.g., restoring to Value Forest mid-phase), we could:
1. Add `current_screen` column to database
2. Persist Value Forest state to database (currently only in localStorage)
3. Add `onAuthStateChange` migration to merge guest localStorage → database on login

These are more complex changes that can be tackled separately if the simple inference approach proves insufficient.

## References

- `src/components/review/review-flow.tsx:139-167` - Current loadReview logic
- `src/lib/guest-storage.ts:403-424` - `loadAuthenticatedReview()` function
- `supabase/schema.sql:21-33` - `annual_reviews` table schema

---

## Plan Review Summary

### DHH Rails Reviewer - Approved
> "Your instinct is correct. Ship the simple solution."

Key points:
- Inferring state from data is the right call - avoids storing redundant state
- Migration complexity for `current_screen` column isn't worth it
- Tradeoffs are acceptable

### Kieran Rails Reviewer - Approved with conditions
Concerns addressed:
- Added null guard for `dbReview.responses` ✓
- Completed state: handled by redirect to `/complete` page ✓

### Code Simplicity Reviewer - Approved with simplifications
Applied:
- Removed unnecessary `if (dbReview.reviewMode)` guard ✓
- Inlined progress check ✓
- Removed redundant comment ✓
