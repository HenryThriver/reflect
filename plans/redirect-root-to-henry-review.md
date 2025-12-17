# Plan: Redirect Root URL to Henry's Review

## Overview

Simplify the user journey for this year's review cycle by redirecting the root URL (`/`) directly to Henry's review welcome page (`/review/henry-finkelstein`). The existing landing page with template browser will be preserved (commented out) for future use.

## Problem Statement

The current landing page adds an unnecessary step - users see a marketing page with multiple template options when the primary goal right now is to get people directly into Henry's annual review flow. For this year's focused launch, a direct path is better.

## Proposed Solution

**Option A (Recommended): Simple redirect in `page.tsx`**

Replace the landing page content with a redirect to `/review/henry-finkelstein`. This is the cleanest approach for Next.js App Router.

## Implementation

### Changes Required

**1. Modify `src/app/page.tsx`**

Current: Full landing page component with hero, template grid, etc.

New: Server-side redirect to Henry's review

```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/review/henry-finkelstein')
}
```

**2. Preserve original landing page**

Rename or comment the original content:
- Option A: Move current `page.tsx` content to `page.tsx.bak` (simplest)
- Option B: Create `src/app/landing/page.tsx` with original content (accessible at `/landing`)

### Files to Modify

| File | Action |
|------|--------|
| `src/app/page.tsx` | Replace with redirect |
| `src/app/page.tsx.bak` | Backup of original (new file) |

## Acceptance Criteria

- [ ] Visiting `/` immediately redirects to `/review/henry-finkelstein`
- [ ] No flash of landing page content before redirect
- [ ] Original landing page code is preserved for future use
- [ ] All other routes continue to work normally

## Rollback Plan

To restore the landing page for next year:
1. Delete the redirect `page.tsx`
2. Rename `page.tsx.bak` back to `page.tsx`

## Notes

- The `/templates` page still exists if anyone needs to access other templates directly
- This change only affects the root URL behavior
- Consider adding the landing page back for 2026 review cycle or when launching publicly
