# feat: Login/Guest Flow with Henry Template (Simplified)

**Date:** 2025-12-09
**Category:** feature
**Priority:** P0 - Required for 12/12 Launch
**Estimated Time:** 3.5 hours

---

## Overview

Implement login/guest decision point on template intro screen with simple warning modal, plus a Henry test template. Use existing Google OAuth + Email/Password auth only.

**Core Flow:**
```
Template Selection → Intro Screen → [Login] or [Continue as Guest]
                                         ↓              ↓
                                    Existing Auth   Simple Warning
                                         ↓              ↓
                                    Save to DB    Save to localStorage
```

---

## Scope (Ruthlessly Minimal)

### Ship This:
- Henry template (3 simple questions)
- Intro screen decision point (Login vs Guest)
- Simple static guest warning modal
- Use EXISTING Google OAuth + Email/Password

### Don't Ship (Backlog):
- ~~LinkedIn OAuth~~ (no user data showing need)
- ~~Magic Link~~ (email deliverability complexity)
- ~~Private mode detection~~ (unreliable, edge case)
- ~~Guest→Auth migration mid-flow~~ (5-min review doesn't need this)

---

## Implementation

### Phase 1: Henry Test Template (30 min)

Create minimal template for testing:

```typescript
// src/lib/templates/henry.ts
import { ReviewTemplate } from './types'

export const henryTemplate: ReviewTemplate = {
  slug: 'henry-finkelstein',
  name: "Henry's Quick Review",
  creator: {
    name: 'Henry A Finkelstein',
    title: 'Builder & Thinker',
    bio: 'A simple 3-question reflection to test the waters.',
  },
  intro: {
    headline: 'Quick Reflection',
    description: 'Three simple questions to get you started. Perfect for testing or a quick check-in.',
    estimatedMinutes: 5,
  },
  questions: [
    {
      id: 'favorite-win',
      text: "What's your favorite win from this year?",
      type: 'textarea',
      placeholder: 'Think about a moment that made you proud...',
      helpText: 'Big or small, what accomplishment stands out?',
      required: true,
    },
    {
      id: 'favorite-lesson',
      text: "What's the most valuable lesson you learned?",
      type: 'textarea',
      placeholder: 'A challenge that taught you something...',
      helpText: 'Growth often comes from difficulty.',
      required: true,
    },
    {
      id: 'favorite-hope',
      text: "What are you most excited about for next year?",
      type: 'textarea',
      placeholder: 'Looking ahead, what energizes you?',
      helpText: 'Dreams, goals, or simple pleasures.',
      required: true,
    },
  ],
}
```

**Files:**
- Create `src/lib/templates/henry.ts`
- Update `src/lib/templates/index.ts` to export

---

### Phase 2: Simple Guest Warning Modal (30 min)

Static warning, no detection logic:

```typescript
// src/components/auth/guest-warning-modal.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface GuestWarningModalProps {
  open: boolean
  onConfirm: () => void
  onCreateAccount: () => void
}

export function GuestWarningModal({
  open,
  onConfirm,
  onCreateAccount,
}: GuestWarningModalProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onConfirm()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Just so you know...</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            Guest mode saves to this browser only. If you clear browser data
            or switch devices, your progress may be lost. Sign up (free) to
            save across devices.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onCreateAccount} className="w-full">
            Sign up instead
          </Button>
          <Button variant="outline" onClick={onConfirm} className="w-full">
            Got it, continue as guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Files:**
- Create `src/components/auth/guest-warning-modal.tsx`

---

### Phase 3: Intro Screen Decision Point (1 hour)

Add Login/Guest buttons to intro:

```typescript
// src/components/templates/template-intro.tsx (modified)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReviewTemplate } from '@/lib/templates/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, User } from 'lucide-react'
import { GuestWarningModal } from '@/components/auth/guest-warning-modal'
import { startGuestReview } from '@/lib/guest-storage'

interface TemplateIntroProps {
  template: ReviewTemplate
  isAuthenticated: boolean
  onStart: () => void
}

export function TemplateIntro({
  template,
  isAuthenticated,
  onStart
}: TemplateIntroProps): JSX.Element {
  const router = useRouter()
  const [showGuestWarning, setShowGuestWarning] = useState(false)

  const handleLogin = (): void => {
    router.push(`/login?redirect=/review/${template.slug}`)
  }

  const handleGuestConfirm = (): void => {
    startGuestReview(template.slug)
    setShowGuestWarning(false)
    onStart()
  }

  const handleCreateAccount = (): void => {
    router.push(`/signup?redirect=/review/${template.slug}`)
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{template.intro.headline}</CardTitle>
          <CardDescription className="text-lg">
            {template.intro.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{template.intro.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>By {template.creator.name}</span>
            </div>
          </div>

          {isAuthenticated ? (
            <Button onClick={onStart} size="lg" className="w-full">
              Start Review
            </Button>
          ) : (
            <div className="space-y-3">
              <Button onClick={handleLogin} size="lg" className="w-full">
                Login to Save Progress
              </Button>
              <Button
                onClick={() => setShowGuestWarning(true)}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Continue as Guest
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Free accounts save your progress across devices
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <GuestWarningModal
        open={showGuestWarning}
        onConfirm={handleGuestConfirm}
        onCreateAccount={handleCreateAccount}
      />
    </>
  )
}
```

**Files:**
- Modify `src/components/templates/template-intro.tsx`
- Modify `src/app/(public)/review/[templateSlug]/page.tsx` to pass `isAuthenticated`

---

### Phase 4: Wire Up Auth Check (30 min)

Update review page to check auth status:

```typescript
// src/app/(public)/review/[templateSlug]/page.tsx (key changes)
import { createClient } from '@/lib/supabase/server'

export default async function ReviewPage({ params }: { params: Promise<{ templateSlug: string }> }) {
  const { templateSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const template = getTemplate(templateSlug)
  if (!template) notFound()

  return (
    <ReviewFlow
      template={template}
      isAuthenticated={!!user}
      userId={user?.id}
    />
  )
}
```

**Files:**
- Modify `src/app/(public)/review/[templateSlug]/page.tsx`
- Modify `src/components/review/review-flow.tsx` to accept `isAuthenticated` prop

---

### Phase 5: Testing (30 min)

**3 Core Test Scenarios:**

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Guest happy path | Select Henry → Guest → Warning → Confirm → Answer 3 → Download | Markdown downloads |
| 2 | Auth happy path | Select Henry → Login → Google OAuth → Answer 3 → Complete | Saved to database |
| 3 | Email/Password | Sign up → Answer → Complete | Account created, saved |

**Manual Checklist:**
- [ ] Henry template shows in browser
- [ ] Unauthenticated users see Login/Guest buttons
- [ ] Authenticated users see "Start Review" only
- [ ] Guest warning modal appears
- [ ] "Sign up instead" redirects to signup
- [ ] "Got it, continue" starts guest flow
- [ ] Guest progress saves to localStorage
- [ ] Auth progress saves to database

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/lib/templates/henry.ts` | Henry test template |
| `src/components/auth/guest-warning-modal.tsx` | Simple guest warning |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/templates/index.ts` | Export Henry template |
| `src/components/templates/template-intro.tsx` | Add login/guest decision |
| `src/app/(public)/review/[templateSlug]/page.tsx` | Pass isAuthenticated |
| `src/components/review/review-flow.tsx` | Accept isAuthenticated prop |

---

## Time Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Henry template | 30 min |
| 2 | Guest warning modal | 30 min |
| 3 | Intro decision point | 1 hour |
| 4 | Wire up auth check | 30 min |
| 5 | Testing | 30 min |
| **Total** | | **3.5 hours** |

---

## What We're NOT Doing (Explicit)

Per reviewer feedback, these are **intentionally excluded**:

1. **LinkedIn OAuth** - No user data showing need. Add post-launch if requested.
2. **Magic Link** - Email deliverability is hard. Google + Email/Password covers users.
3. **Private mode detection** - Unreliable, edge case. Same warning for everyone.
4. **Guest→Auth migration** - 5-min review doesn't need mid-flow conversion. Guests complete as guests, can sign up after for future reviews.
5. **Custom error messages** - Generic "Login failed, try again" is fine for MVP.
6. **State machine diagrams** - Code is the truth.

---

## Success Criteria

- [ ] Henry template exists with 3 questions
- [ ] Intro shows decision point for unauthenticated users
- [ ] Guest warning modal works
- [ ] Google OAuth flow works end-to-end
- [ ] Email/Password signup works
- [ ] Guest saves to localStorage
- [ ] Auth saves to database
- [ ] All 3 test scenarios pass

---

## References

- Decision doc: `/compound-ai-leadership/docs/decisions/product/2025-12-08-annual-review-product.md`
- Existing auth: `src/app/(auth)/login/page.tsx`
- Guest storage: `src/lib/guest-storage.ts`
- Existing templates: `src/lib/templates/gustin.ts`
