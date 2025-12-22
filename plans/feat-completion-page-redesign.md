# Completion Page Redesign

## Overview

Transform the post-review completion page from a functional download screen into a warm, celebratory experience that honors the user's accomplishment, creates urgency around the vault closing date, and introduces "The Grove" — a quarterly review subscription that continues the reflection journey.

**Affected page**: `/review/[templateSlug]/complete`

**Current state**: Green checkmark, question stats, download button, generic vault upsell, "Start Fresh" and "Try Different Template" buttons.

**Target state**: Subtle confetti celebration, warm personalized messaging, vault urgency countdown, Grove upsell with Q1 check-in countdown, social sharing modal.

---

## Problem Statement

The current completion page treats finishing 100+ questions of deep reflection as a transactional event — "here's your download, want to pay?" This misses the emotional significance of what the user just accomplished. Few people take time for annual reviews, and those who complete this one deserve recognition.

Additionally, the "Vault" branding sounds locked-in and the upsell focuses on generic cloud storage features rather than the real value: quarterly check-ins that keep users aligned with their annual intentions throughout the year.

---

## Proposed Solution

Redesign the completion page with four distinct sections:

1. **Celebration Hero** — Confetti animation, warm headline, personalized greeting
2. **Download CTA** — Markdown download with vault closure urgency messaging
3. **The Grove Upsell** — Quarterly review subscription with Q1 countdown
4. **Social Sharing** — LinkedIn/Twitter share with editable modal

---

## Technical Approach

### Architecture

```
src/app/(public)/review/[templateSlug]/complete/
├── page.tsx                    # Main completion page (update existing)
├── components/
│   ├── celebration-hero.tsx    # Confetti + warm greeting
│   ├── download-section.tsx    # Download CTA + urgency
│   ├── grove-upsell.tsx        # Subscription upsell + countdown
│   ├── social-share-modal.tsx  # Editable share dialog
│   └── countdown-timer.tsx     # Reusable days+hours countdown
```

### Dependencies to Add

```bash
npm install canvas-confetti react-share
npm install -D @types/canvas-confetti
```

### Key Technical Decisions

1. **Confetti**: Use `canvas-confetti` for performance (not React-based re-renders)
2. **Countdown**: Custom hook with hydration-safe pattern to avoid SSR mismatches
3. **Social Share**: Use `react-share` for Twitter, custom copy-to-clipboard for LinkedIn (LinkedIn doesn't support pre-filled text)
4. **Dialog**: Existing shadcn/ui Dialog component for share modal
5. **Personalization**: Extract name from email prefix (e.g., "henry" from "henry@example.com") — capitalize first letter

---

## Implementation Phases

### Phase 1: Celebration Hero

**Files to modify/create:**
- `src/app/(public)/review/[templateSlug]/complete/page.tsx`
- `src/components/completion/celebration-hero.tsx` (new)

**Tasks:**
- [ ] Install `canvas-confetti` package
- [ ] Create `CelebrationHero` component with confetti trigger on mount
- [ ] Configure confetti: 100 particles, 70 spread, 0.6 origin, fade after 2-3 seconds
- [ ] Add sessionStorage flag to prevent confetti replay on page revisit
- [ ] Implement warm headline: "You did it." with supportive subtext
- [ ] Add personalization logic: extract name from email prefix for authenticated users
- [ ] Display question stats in softer presentation: "You answered X of Y questions"

**Personalization logic:**
```typescript
// src/lib/utils.ts
export function getDisplayName(email: string | null): string | null {
  if (!email) return null
  const prefix = email.split('@')[0]
  // Capitalize first letter, handle edge cases
  return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase()
}
```

**Component structure:**
```typescript
// src/components/completion/celebration-hero.tsx
'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface CelebrationHeroProps {
  displayName: string | null
  answeredCount: number
  totalQuestions: number
}

export function CelebrationHero({ displayName, answeredCount, totalQuestions }: CelebrationHeroProps) {
  const [hasPlayed, setHasPlayed] = useState(false)

  useEffect(() => {
    const played = sessionStorage.getItem('confetti-played')
    if (played) {
      setHasPlayed(true)
      return
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      gravity: 0.5,
      decay: 0.94,
      ticks: 200,
    })

    sessionStorage.setItem('confetti-played', 'true')
    setHasPlayed(true)
  }, [])

  const greeting = displayName ? `You did it, ${displayName}.` : 'You did it.'

  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold">{greeting}</h1>
      <p className="text-lg text-muted-foreground">
        This took courage. You just did something most people never do.
      </p>
      <p className="text-sm text-muted-foreground">
        You answered {answeredCount} of {totalQuestions} questions.
      </p>
    </div>
  )
}
```

---

### Phase 2: Download Section with Urgency

**Files to modify/create:**
- `src/components/completion/download-section.tsx` (new)
- `src/lib/vault-dates.ts` (new)

**Tasks:**
- [ ] Create `DownloadSection` component with existing download logic
- [ ] Add vault closure date constant: January 11th
- [ ] Add urgency messaging with vault closure date
- [ ] Add "or wait until December 12th, 2026" messaging
- [ ] Keep existing download state toggle (Downloaded! checkmark)
- [ ] Style with warm, gentle urgency (not aggressive)

**Vault dates utility:**
```typescript
// src/lib/vault-dates.ts
export const VAULT_OPEN_MONTH = 11  // December (0-indexed)
export const VAULT_OPEN_DAY = 12
export const VAULT_CLOSE_MONTH = 0  // January (0-indexed)
export const VAULT_CLOSE_DAY = 11

export function getVaultCloseDate(year: number): Date {
  // Vault closes January 11 of the following year
  return new Date(year + 1, VAULT_CLOSE_MONTH, VAULT_CLOSE_DAY, 23, 59, 59)
}

export function getNextVaultOpenDate(year: number): Date {
  // Next vault opens December 12 of the following year
  return new Date(year + 1, VAULT_OPEN_MONTH, VAULT_OPEN_DAY)
}

export function isVaultOpen(): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const vaultOpen = new Date(year, VAULT_OPEN_MONTH, VAULT_OPEN_DAY)
  const vaultClose = new Date(year + 1, VAULT_CLOSE_MONTH, VAULT_CLOSE_DAY, 23, 59, 59)

  return now >= vaultOpen && now <= vaultClose
}
```

**Component structure:**
```typescript
// src/components/completion/download-section.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Check } from 'lucide-react'
import { getVaultCloseDate, getNextVaultOpenDate } from '@/lib/vault-dates'

interface DownloadSectionProps {
  onDownload: () => void
}

export function DownloadSection({ onDownload }: DownloadSectionProps) {
  const [isDownloaded, setIsDownloaded] = useState(false)

  const currentYear = new Date().getFullYear()
  const vaultCloseDate = getVaultCloseDate(currentYear)
  const nextOpenDate = getNextVaultOpenDate(currentYear)

  const handleDownload = () => {
    onDownload()
    setIsDownloaded(true)
  }

  const formattedCloseDate = vaultCloseDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })

  const formattedNextOpen = nextOpenDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-4">
      <Button
        onClick={handleDownload}
        size="lg"
        variant={isDownloaded ? 'outline' : 'default'}
        className="w-full"
      >
        {isDownloaded ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Downloaded!
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Download as Markdown
          </>
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        The vault closes {formattedCloseDate}. Download your answers to keep them forever
        — or wait until {formattedNextOpen} to see them again.
      </p>
    </div>
  )
}
```

---

### Phase 3: The Grove Upsell

**Files to modify/create:**
- `src/components/completion/grove-upsell.tsx` (new)
- `src/components/completion/countdown-timer.tsx` (new)
- `src/lib/stripe/actions.ts` (modify for dual pricing)

**Tasks:**
- [ ] Create `CountdownTimer` component with hydration-safe pattern
- [ ] Calculate Q1 check-in date (April 1st — one week after Q1 ends)
- [ ] Create `GroveUpsell` component with new branding
- [ ] Replace sparkle icon with crystal ball (using Sparkles from lucide as closest match)
- [ ] Add dual pricing: $5/month or $50/year
- [ ] Modify Stripe checkout to accept price selection
- [ ] Show different content for existing subscribers
- [ ] Add secondary benefits (cloud sync, multi-year history) in muted style

**Countdown component:**
```typescript
// src/components/completion/countdown-timer.tsx
'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: Date
  label: string
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 })

  useEffect(() => {
    setMounted(true)

    const calculateTime = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const diff = Math.max(0, target - now)

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      setTimeLeft({ days, hours })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [targetDate])

  if (!mounted) {
    return <span className="text-muted-foreground">Loading...</span>
  }

  return (
    <span>
      {label} in {timeLeft.days} days, {timeLeft.hours} hours
    </span>
  )
}
```

**Q1 date calculation:**
```typescript
// src/lib/quarterly-dates.ts
export function getQ1CheckinDate(year: number): Date {
  // Q1 check-in opens April 1st (week after Q1 ends March 31)
  return new Date(year, 3, 1) // April 1
}

export function getNextQuarterlyCheckinDate(): Date {
  const now = new Date()
  const year = now.getFullYear()

  const quarters = [
    new Date(year, 3, 1),   // Q1: April 1
    new Date(year, 6, 1),   // Q2: July 1
    new Date(year, 9, 1),   // Q3: October 1
    new Date(year + 1, 0, 1) // Q4: January 1 (next year)
  ]

  for (const date of quarters) {
    if (date > now) return date
  }

  // If past all quarters, return next year's Q1
  return new Date(year + 1, 3, 1)
}
```

**Upsell component:**
```typescript
// src/components/completion/grove-upsell.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Cloud, History } from 'lucide-react'
import { CountdownTimer } from './countdown-timer'
import { getNextQuarterlyCheckinDate } from '@/lib/quarterly-dates'
import { checkoutWithStripe } from '@/lib/stripe/actions'

interface GroveUpsellProps {
  hasSubscription: boolean
  templateSlug: string
}

export function GroveUpsell({ hasSubscription, templateSlug }: GroveUpsellProps) {
  const nextCheckin = getNextQuarterlyCheckinDate()

  if (hasSubscription) {
    return (
      <div className="text-center space-y-4 p-6 bg-muted/50 rounded-lg">
        <Sparkles className="w-8 h-8 mx-auto text-purple-500" />
        <h2 className="text-xl font-semibold">You're in The Grove</h2>
        <p className="text-muted-foreground">
          <CountdownTimer targetDate={nextCheckin} label="Your Q1 check-in opens" />
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <div className="text-center space-y-2">
        <Sparkles className="w-8 h-8 mx-auto text-purple-500" />
        <h2 className="text-xl font-semibold">Continue with The Grove</h2>
        <p className="text-muted-foreground">
          Quarterly check-ins that pull from your annual review to keep you aligned with what matters.
        </p>
        <p className="text-sm text-purple-600 font-medium">
          <CountdownTimer targetDate={nextCheckin} label="Your Q1 check-in opens" />
        </p>
      </div>

      <div className="flex gap-3">
        <form action={checkoutWithStripe} className="flex-1">
          <input type="hidden" name="priceType" value="monthly" />
          <input type="hidden" name="returnTo" value={`/review/${templateSlug}/complete`} />
          <Button type="submit" variant="outline" className="w-full">
            $5/month
          </Button>
        </form>

        <form action={checkoutWithStripe} className="flex-1">
          <input type="hidden" name="priceType" value="yearly" />
          <input type="hidden" name="returnTo" value={`/review/${templateSlug}/complete`} />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            $50/year
          </Button>
        </form>
      </div>

      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Cloud className="w-3 h-3" />
          Cloud sync
        </span>
        <span className="flex items-center gap-1">
          <History className="w-3 h-3" />
          Multi-year history
        </span>
      </div>
    </div>
  )
}
```

**Stripe action modification:**
```typescript
// src/lib/stripe/actions.ts (add to existing)

// Add new price ID env var
const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_YEARLY!

export async function checkoutWithStripe(formData?: FormData) {
  // ... existing auth checks ...

  const priceType = formData?.get('priceType') as string || 'monthly'
  const priceId = priceType === 'yearly' ? STRIPE_PRICE_YEARLY : STRIPE_PRICE_MONTHLY

  // ... rest of checkout logic with selected priceId ...
}
```

---

### Phase 4: Social Sharing

**Files to modify/create:**
- `src/components/completion/social-share-modal.tsx` (new)
- `src/components/completion/social-share-buttons.tsx` (new)

**Tasks:**
- [ ] Install `react-share` package
- [ ] Create `SocialShareModal` with editable textarea
- [ ] Use shadcn Dialog for modal container
- [ ] Pre-fill default share text with question count
- [ ] Add image preview using existing `handwritten-review.jpg`
- [ ] Implement Twitter share with `react-share` (supports pre-filled text)
- [ ] Implement LinkedIn share with copy-to-clipboard (LinkedIn doesn't support pre-fill)
- [ ] Add success toast after copying for LinkedIn
- [ ] Remove "Start Fresh" and "Try Different Template" buttons

**Share modal component:**
```typescript
// src/components/completion/social-share-modal.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TwitterShareButton, XIcon, LinkedinIcon } from 'react-share'
import { Share2, Check, Copy } from 'lucide-react'
import Image from 'next/image'

interface SocialShareModalProps {
  shareUrl: string
  questionCount: number
  templateName: string
}

export function SocialShareModal({ shareUrl, questionCount, templateName }: SocialShareModalProps) {
  const currentYear = new Date().getFullYear()
  const defaultText = `I just completed my ${currentYear} annual review. ${questionCount}+ questions. Absolutely worth it.`

  const [shareText, setShareText] = useState(defaultText)
  const [copied, setCopied] = useState(false)

  const handleCopyForLinkedIn = async () => {
    await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share your achievement
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your achievement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image preview */}
          <div className="rounded-lg overflow-hidden border">
            <Image
              src="/images/handwritten-review.jpg"
              alt="Annual review preview"
              width={400}
              height={210}
              className="w-full object-cover"
            />
          </div>

          {/* Editable text */}
          <Textarea
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            rows={3}
            placeholder="Customize your message..."
          />

          {/* Share buttons */}
          <div className="flex gap-3">
            <TwitterShareButton
              url={shareUrl}
              title={shareText}
              className="flex-1"
            >
              <Button variant="outline" className="w-full gap-2">
                <XIcon size={20} round />
                Share on X
              </Button>
            </TwitterShareButton>

            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopyForLinkedIn}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <LinkedinIcon size={20} round />
                  Copy for LinkedIn
                </>
              )}
            </Button>
          </div>

          {copied && (
            <p className="text-sm text-muted-foreground text-center">
              Paste in LinkedIn to share
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Phase 5: Integration & Cleanup

**Files to modify:**
- `src/app/(public)/review/[templateSlug]/complete/page.tsx`

**Tasks:**
- [ ] Import all new components
- [ ] Wire up user authentication state for personalization
- [ ] Wire up subscription status for Grove upsell
- [ ] Pass props to all components
- [ ] Remove old "Start Fresh" and "Try Different Template" buttons
- [ ] Remove Vault icon import (no longer used)
- [ ] Remove Sparkles import for vault features (repurposed for Grove)
- [ ] Test full flow end-to-end

**Updated page structure:**
```typescript
// src/app/(public)/review/[templateSlug]/complete/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import { getTemplate } from '@/lib/templates'
import { getGuestReview } from '@/lib/guest-storage'
import { generateMarkdown, downloadMarkdown } from '@/lib/markdown/generator'
import { VALUE_FOREST_QUESTION_COUNT } from '@/lib/value-trees/constants'
import { getDisplayName } from '@/lib/utils'
import { LoadingState } from '@/components/ui/loading-state'
import { CelebrationHero } from '@/components/completion/celebration-hero'
import { DownloadSection } from '@/components/completion/download-section'
import { GroveUpsell } from '@/components/completion/grove-upsell'
import { SocialShareModal } from '@/components/completion/social-share-modal'

interface CompletionPageProps {
  params: Promise<{ templateSlug: string }>
  user?: { id: string; email?: string } | null
  hasSubscription?: boolean
}

export default function CompletionPage({ params, user, hasSubscription = false }: CompletionPageProps) {
  const { templateSlug } = use(params)
  const template = getTemplate(templateSlug)
  const [guestReview, setGuestReview] = useState<ReturnType<typeof getGuestReview>>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setGuestReview(getGuestReview(templateSlug))
  }, [templateSlug])

  const handleDownload = () => {
    if (!template || !guestReview) return
    const markdown = generateMarkdown(template, guestReview.responses, new Date())
    const year = new Date().getFullYear()
    const filename = `${template.slug}-${year}.md`
    downloadMarkdown(markdown, filename)
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Template not found</p>
      </div>
    )
  }

  if (!isClient) {
    return <LoadingState />
  }

  const responses = guestReview?.responses ?? {}
  const answeredCount = Object.values(responses).filter((r) => r.trim()).length
  const isHenryTemplate = template.slug === 'henry-finkelstein'
  const totalQuestions = isHenryTemplate
    ? template.questions.length + VALUE_FOREST_QUESTION_COUNT
    : template.questions.length

  const displayName = user?.email ? getDisplayName(user.email) : null
  const shareUrl = `${process.env.NEXT_PUBLIC_URL}/review/${templateSlug}`

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <CelebrationHero
          displayName={displayName}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
        />

        <DownloadSection onDownload={handleDownload} />

        <GroveUpsell
          hasSubscription={hasSubscription}
          templateSlug={templateSlug}
        />

        <div className="flex justify-center">
          <SocialShareModal
            shareUrl={shareUrl}
            questionCount={totalQuestions}
            templateName={template.name}
          />
        </div>
      </div>
    </div>
  )
}
```

---

## Alternative Approaches Considered

### 1. Framer Motion for animations
**Rejected**: Adds significant bundle size for a one-time confetti effect. canvas-confetti is lighter and purpose-built.

### 2. Server-side countdown rendering
**Rejected**: Causes hydration mismatches due to timezone differences. Client-side with hydration guard is more reliable.

### 3. Custom social share URLs instead of react-share
**Considered viable**: Could reduce dependencies, but react-share handles edge cases and provides consistent UX.

### 4. First name database field
**Rejected for now**: Would require migration, auth flow changes. Email prefix extraction is a reasonable compromise.

---

## Acceptance Criteria

### Functional Requirements

- [ ] Confetti animation plays on first page load, fades after 2-3 seconds
- [ ] Confetti does not replay on page revisit within same session
- [ ] Personalized greeting shows for authenticated users (email prefix extraction)
- [ ] Universal greeting shows for guest users
- [ ] Question stats display correctly (including Value Forest for henry template)
- [ ] Download button triggers markdown file download
- [ ] Download button shows "Downloaded!" state after click
- [ ] Vault closure date displays correctly (January 11th)
- [ ] Next vault open date displays correctly (December 12th, following year)
- [ ] Grove upsell shows for non-subscribers with Q1 countdown
- [ ] Grove confirmation shows for existing subscribers
- [ ] Both pricing options work ($5/month, $50/year)
- [ ] Social share modal opens with pre-filled editable text
- [ ] Twitter share opens Twitter with pre-filled text
- [ ] LinkedIn copy button copies text to clipboard
- [ ] Copied confirmation shows after LinkedIn copy
- [ ] "Start Fresh" and "Try Different Template" buttons are removed

### Non-Functional Requirements

- [ ] Page loads in under 2 seconds
- [ ] Confetti animation runs at 60fps without jank
- [ ] Countdown updates every minute without memory leaks
- [ ] Modal is keyboard accessible (ESC to close, Tab navigation)
- [ ] All text is readable on mobile (min 16px body text)

### Quality Gates

- [ ] TypeScript compiles without errors
- [ ] All components have proper TypeScript interfaces
- [ ] No console errors or warnings in browser
- [ ] Tested on Chrome, Safari, Firefox
- [ ] Tested on mobile viewport (375px width)

---

## Success Metrics

1. **Download rate**: % of completers who download markdown (baseline TBD)
2. **Grove conversion**: % of completers who subscribe (target: 5%)
3. **Social share rate**: % of completers who click share (target: 10%)
4. **Time on page**: Increased engagement time indicates appreciation of celebration

---

## Dependencies & Prerequisites

1. **Stripe yearly price ID**: Need `STRIPE_PRICE_YEARLY` environment variable configured
2. **User subscription status**: Need to pass `hasSubscription` prop to completion page
3. **User email**: Need to pass authenticated user's email to page for personalization
4. **OG image dimensions**: Verify `handwritten-review.jpg` is 1200x630px for optimal social sharing

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Confetti causes performance issues on low-end devices | Low | Medium | Use canvas-confetti (optimized), limit particle count |
| Email prefix extraction produces awkward names | Medium | Low | Handle edge cases (numbers, underscores), fallback to universal greeting |
| Countdown shows incorrect time due to timezone | Medium | High | Use UTC for calculations, clearly document timezone policy |
| LinkedIn copy flow feels clunky | Medium | Low | Clear "Paste in LinkedIn" instruction, success feedback |
| Stripe yearly price not configured | Low | High | Add env var check with helpful error message |

---

## Documentation Plan

- [ ] Update CLAUDE.md with Grove branding decision
- [ ] Add vault dates documentation to README
- [ ] Document quarterly check-in date calculation logic

---

## References & Research

### Internal References

- Current completion page: `src/app/(public)/review/[templateSlug]/complete/page.tsx`
- Guest storage: `src/lib/guest-storage.ts`
- Stripe actions: `src/lib/stripe/actions.ts`
- Dialog component: `src/components/ui/dialog.tsx`
- Button component: `src/components/ui/button.tsx`
- Share image: `public/images/handwritten-review.jpg`

### External References

- canvas-confetti: https://www.npmjs.com/package/canvas-confetti
- react-share: https://www.npmjs.com/package/react-share
- shadcn/ui Dialog: https://ui.shadcn.com/docs/components/dialog
- Tailwind animations: https://tailwindcss.com/docs/animation
- Lucide icons: https://lucide.dev

### Related Work

- Stripe subscription flow: `plans/feat-stripe-subscription-completion-page.md`

---

## Open Questions (Resolved)

1. **Personalization source**: Use email prefix extraction (e.g., "henry" from "henry@example.com")
2. **Vault timezone**: Use user's local timezone for display, store in UTC
3. **Q1 check-in date**: April 1st (one week after Q1 ends)
4. **Confetti replay**: Once per session (sessionStorage flag)
5. **LinkedIn limitation**: Use copy-to-clipboard with clear instruction

## Open Questions (Pending)

1. **Download after vault closes**: Can users still download after Jan 11? (Assumed: Yes, completion page remains accessible)
2. **Guest subscription flow**: Must guests create account first? (Assumed: Yes, redirect to signup)
3. **Partial completion access**: Can users access completion page without 100% completion? (Assumed: Redirect if incomplete)
