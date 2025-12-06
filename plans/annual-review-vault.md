# Annual Review Vault

## Overview

Build a beautiful shell for hosting multiple "flavors" of annual review questionnaires from different creators (e.g., Henry's Review, Dr. Anthony Gustin's Review, TK Krader's Review).

**Key Concept**: The app is a platform for curated annual review experiences, not a single fixed questionnaire. Each template has its own creator, intro, questions, and style.

### Freemium Model

| Feature | Free (No Login) | Vault ($5/mo or $50/yr) |
|---------|-----------------|-------------------------|
| Complete any review | ✅ | ✅ |
| Download as Markdown | ✅ | ✅ |
| Save progress | ❌ | ✅ |
| Resume later | ❌ | ✅ |
| Vault (lock & reveal) | ❌ | ✅ |
| Multi-year history | ❌ | ✅ |

**Free Path**: Anyone can complete a full annual review without signing up. At the end, they download a beautifully formatted markdown file with all their answers. No data is saved server-side.

**Paid Path**: Users who want to save progress, come back later, and experience the "time capsule" vault unlock pay $5/month or $50/year.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui + MagicUI + Shadcn Studio
- **Database & Auth**: Supabase (PostgreSQL, Auth, RLS)
- **Payments**: Stripe (Checkout, Customer Portal, Webhooks)
- **Deployment**: Vercel
- **Version Control**: GitHub

## Core Mechanics

### Pricing Tiers

**Free Tier (Guest Mode)**
- No account required
- Complete entire review in one session
- All responses stored in browser (localStorage)
- At completion: generate and download markdown file
- No server-side storage
- Can upgrade mid-session and migrate answers

**Vault Tier ($5/month or $50/year)**
- Account required
- Auto-save progress to database
- Resume anytime across devices
- Vault locking/unlocking cycle
- Multi-year review history
- Celebratory unlock ceremony

### Review Window Schedule
- **Opens**: December 12 at 00:00 UTC
- **Closes**: January 11 at 23:59 UTC
- **Duration**: 31 days to complete annual reviews

### Multi-Template System
- Multiple review templates from different creators
- Users can complete multiple different templates per year
- Each template has: creator info, intro screen, ordered questions
- Templates managed via code/seed data (no admin UI needed)

### Typeform-Style Experience
- One question displayed at a time, full-screen
- Smooth transitions between questions
- Progress indicator (e.g., "5 of 20")
- Keyboard navigation (Enter to advance, arrow keys)

### Vault States (Paid users only, per template per year)
1. **Draft** - In progress or complete, editable until window closes
2. **Locked** - Window closed, hidden for ~11 months (metadata only visible)
3. **Unlocked** - Revealed with celebratory ceremony

Note: "Not started" = no database row exists. We don't need a separate "submitted" state since users can edit until the window closes anyway.

---

## Proposed Solution

### Phase 1: Foundation

#### 1.1 Project Setup

```
/app
  /(public)
    /page.tsx                              # Landing page
    /templates/page.tsx                    # Browse templates (public)
    /review/[templateSlug]/page.tsx        # Guest review flow
    /review/[templateSlug]/intro/page.tsx  # Template intro
    /review/[templateSlug]/complete/page.tsx # Completion + download
    /pricing/page.tsx                      # Pricing page (links to Stripe Payment Links)
  /(auth)
    /login/page.tsx
    /signup/page.tsx
    /auth/callback/route.ts
  /(protected)
    /dashboard/page.tsx                    # Subscriber dashboard + guest migration
    /vault/[year]/page.tsx                 # View unlocked vaults
    /vault/[year]/[templateSlug]/page.tsx  # Specific vault viewer
    /account/page.tsx                      # Account settings (links to Stripe Portal)
  /api
    /stripe
      /webhook/route.ts                    # Handle Stripe events (only route needed)
    /cron
      /update-vault-status/route.ts        # Daily vault status updates
  /layout.tsx

/components
  /ui                         # shadcn/ui components
  /review
    /typeform-question.tsx    # Single question full-screen display
    /question-transition.tsx  # Animated transitions
    /progress-bar.tsx         # Minimal progress indicator
    /navigation-hints.tsx     # Keyboard/swipe hints
    /completion-screen.tsx    # Download or upgrade prompt
  /templates
    /template-card.tsx        # Template preview card
    /template-intro.tsx       # Full intro screen component
    /creator-badge.tsx        # Creator attribution
  /vault
    /locked-vault-card.tsx
    /unlock-ceremony.tsx
    /vault-viewer.tsx
  /dashboard
    /vault-timeline.tsx
    /countdown-timer.tsx
    /active-reviews.tsx
  /pricing
    /pricing-card.tsx
    /feature-comparison.tsx
  /marketing
    /upgrade-prompt.tsx       # Shown to free users at completion

/lib
  /supabase
    /client.ts
    /server.ts
    /middleware.ts
  /stripe
    /config.ts                # Payment Link URLs only
  /templates
    /index.ts                 # Template registry & lookup
    /henry.ts
    /gustin.ts
    /krader.ts
    /types.ts
  /markdown
    /generator.ts             # Generate markdown from responses
  /guest-storage.ts           # localStorage wrapper for guest reviews
  /constants.ts
  /utils.ts

/utils
  /schemas.ts                 # Zod schemas

middleware.ts
```

#### 1.2 Template Type Definitions

```typescript
// lib/templates/types.ts

export interface ReviewTemplate {
  slug: string                    // URL-friendly identifier
  name: string                    // Display name
  creator: Creator
  intro: TemplateIntro
  questions: Question[]
  theme?: TemplateTheme           // Optional custom styling
}

export interface Creator {
  name: string
  title?: string                  // e.g., "Founder of Perfect Keto"
  avatarUrl?: string
  bio?: string
  websiteUrl?: string
}

export interface TemplateIntro {
  headline: string                // e.g., "Reflect. Reset. Rise."
  description: string             // 2-3 sentences about this review
  estimatedMinutes: number        // e.g., 30
  imageUrl?: string               // Optional hero image
}

export interface Question {
  id: string                      // Unique within template
  text: string                    // The question
  type: 'textarea' | 'text' | 'select' | 'scale'
  placeholder?: string
  helpText?: string               // Optional guidance
  required?: boolean
  options?: string[]              // For select type
  minValue?: number               // For scale type
  maxValue?: number
}

export interface TemplateTheme {
  primaryColor?: string
  backgroundColor?: string
  fontFamily?: string
}
```

#### 1.3 Example Template Definition

```typescript
// lib/templates/henry.ts
import { ReviewTemplate } from './types'

export const henryTemplate: ReviewTemplate = {
  slug: 'henry-annual-review',
  name: "Henry's Annual Review",
  creator: {
    name: 'Henry Finkelstein',
    title: 'Builder & Thinker',
    bio: 'A reflection framework I use every year to close one chapter and open the next.',
  },
  intro: {
    headline: 'Reflect. Reset. Rise.',
    description: 'This 20-question journey will help you celebrate wins, process challenges, and set intentions for the year ahead. Take your time—there are no wrong answers.',
    estimatedMinutes: 30,
  },
  questions: [
    // Phase 1: Reflection
    {
      id: 'accomplishments',
      text: 'What were your biggest accomplishments this year?',
      type: 'textarea',
      placeholder: 'Think about personal wins, professional milestones, relationships...',
      helpText: 'Don\'t be humble. Celebrate everything you achieved.',
      required: true,
    },
    {
      id: 'challenges',
      text: 'What challenges did you face, and how did you handle them?',
      type: 'textarea',
      placeholder: 'Describe the obstacles and how you responded...',
      required: true,
    },
    // ... remaining questions same as before
  ],
}
```

#### 1.4 Database Schema

**Design Decision**: Templates and questions live in code only (TypeScript). The database stores user data only: subscriptions and annual reviews with responses.

**JSONB for Responses**: Responses are stored as a JSONB object keyed by question ID. This is simpler than a normalized `responses` table. Trade-off: if we need to query individual answers across users (e.g., "show me all answers to question X"), we'd need to reconsider. For now, we only ever read a user's complete review, so JSONB is ideal.

```sql
-- Users managed by Supabase Auth (auth.users)

-- User subscriptions (synced from Stripe)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('active', 'canceled', 'past_due', 'inactive')),
  price_id TEXT,                          -- Stripe price ID
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's annual review instances (PAID USERS ONLY)
-- Templates are referenced by slug (defined in code)
CREATE TABLE annual_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_slug TEXT NOT NULL,            -- References code-defined template
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'locked', 'unlocked')),
  current_question_index INTEGER DEFAULT 0,
  responses JSONB DEFAULT '{}'::jsonb,    -- { "question_id": "answer_text", ... }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_slug, year)
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_annual_reviews_user ON annual_reviews(user_id);
CREATE INDEX idx_annual_reviews_user_year ON annual_reviews(user_id, year);
CREATE INDEX idx_annual_reviews_status ON annual_reviews(status);
```

#### 1.5 Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_reviews ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can only view their own
CREATE POLICY "Users view own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Annual reviews: Users can only access their own
-- Note: Subscription check happens in application layer, not RLS
-- This keeps RLS simple and fast
CREATE POLICY "Users own their reviews"
ON annual_reviews FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their reviews"
ON annual_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update draft/unlocked reviews"
ON annual_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('draft', 'unlocked'))
WITH CHECK (auth.uid() = user_id);

-- Note: DELETE not allowed - we preserve review history
```

**Design Decision**: Subscription status is checked in the application layer (Server Actions), not RLS. This keeps policies simple and avoids complex joins in every row access. The trade-off is that we must remember to check subscription status in our code, but it's more maintainable.

### Phase 2: Guest Review Flow (Free Tier)

#### 2.1 Guest Flow Architecture

```
Guest lands on /templates
       ↓
Selects a template → /review/[slug]/intro
       ↓
Begins review → /review/[slug] (typeform experience)
       ↓
All responses stored in localStorage
       ↓
Completes all questions → /review/[slug]/complete
       ↓
Options:
  1. Download Markdown (free) → generates file client-side
  2. Save to Vault (paid) → redirect to /signup (answers preserved in localStorage for migration)
```

#### 2.2 Guest State Management

**Design Decision**: Using localStorage directly instead of Zustand.

**When to Reconsider (Signals for Zustand)**:
- Multiple components need to react to the same state change in real-time
- Complex derived state that needs memoization
- State transitions that need middleware (logging, validation, undo/redo)
- DevTools debugging becomes critical for state issues

For now, localStorage with a thin utility wrapper is sufficient. Each page reads/writes directly.

```typescript
// lib/guest-storage.ts

const STORAGE_KEY = 'guest-annual-review'

export interface GuestReview {
  templateSlug: string
  currentQuestionIndex: number
  responses: Record<string, string>  // { questionId: answer }
  startedAt: string
  completedAt: string | null
}

export interface GuestStorage {
  reviews: Record<string, GuestReview>  // keyed by templateSlug
}

function getStorage(): GuestStorage {
  if (typeof window === 'undefined') return { reviews: {} }
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : { reviews: {} }
}

function setStorage(data: GuestStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getGuestReview(templateSlug: string): GuestReview | null {
  return getStorage().reviews[templateSlug] ?? null
}

export function startGuestReview(templateSlug: string): GuestReview {
  const storage = getStorage()
  const review: GuestReview = {
    templateSlug,
    currentQuestionIndex: 0,
    responses: {},
    startedAt: new Date().toISOString(),
    completedAt: null,
  }
  storage.reviews[templateSlug] = review
  setStorage(storage)
  return review
}

export function saveGuestResponse(
  templateSlug: string,
  questionId: string,
  answer: string
): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.responses[questionId] = answer
  setStorage(storage)
}

export function setQuestionIndex(templateSlug: string, index: number): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.currentQuestionIndex = index
  setStorage(storage)
}

export function completeGuestReview(templateSlug: string): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.completedAt = new Date().toISOString()
  setStorage(storage)
}

export function clearGuestReview(templateSlug: string): void {
  const storage = getStorage()
  delete storage.reviews[templateSlug]
  setStorage(storage)
}

export function getAllGuestReviews(): Record<string, GuestReview> {
  return getStorage().reviews
}
```

#### 2.3 Markdown Generator

```typescript
// lib/markdown/generator.ts
import { ReviewTemplate, Question } from '@/lib/templates/types'

export function generateMarkdown(
  template: ReviewTemplate,
  responses: Record<string, string>,
  completedAt: Date
): string {
  const year = completedAt.getFullYear()
  const formattedDate = completedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let markdown = `# ${template.name} - ${year}\n\n`
  markdown += `> ${template.intro.headline}\n\n`
  markdown += `**Completed**: ${formattedDate}\n`
  markdown += `**Template by**: ${template.creator.name}`
  if (template.creator.title) {
    markdown += ` (${template.creator.title})`
  }
  markdown += `\n\n---\n\n`

  for (const question of template.questions) {
    const answer = responses[question.id] || '_No response_'
    markdown += `## ${question.text}\n\n`
    markdown += `${answer}\n\n`
  }

  markdown += `---\n\n`
  markdown += `*Generated by Annual Review Vault*\n`

  return markdown
}

export function downloadMarkdown(
  content: string,
  filename: string
): void {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

#### 2.4 Completion Screen

```typescript
// app/(public)/review/[templateSlug]/complete/page.tsx
'use client'

import { use } from 'react'
import { getTemplate } from '@/lib/templates'
import { getGuestReview } from '@/lib/guest-storage'
import { generateMarkdown, downloadMarkdown } from '@/lib/markdown/generator'
import { Button } from '@/components/ui/button'
import { Download, Vault, Check } from 'lucide-react'

// Next.js 15: params is now a Promise
export default function CompletionPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>
}) {
  const { templateSlug } = use(params)
  const template = getTemplate(templateSlug)
  const guestReview = getGuestReview(templateSlug)
  const responses = guestReview?.responses ?? {}

  const handleDownload = () => {
    if (!template) return
    const markdown = generateMarkdown(template, responses, new Date())
    const filename = `${template.slug}-${new Date().getFullYear()}.md`
    downloadMarkdown(markdown, filename)
  }

  const handleUpgrade = () => {
    // Answers stay in localStorage - migration happens after signup + payment
    window.location.href = '/signup?redirect=/pricing'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Review Complete!</h1>
          <p className="text-muted-foreground">
            You've finished {template?.name}. What would you like to do next?
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleDownload}
            size="lg"
            variant="outline"
            className="w-full"
          >
            <Download className="w-5 h-5 mr-2" />
            Download as Markdown
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <Button
            onClick={handleUpgrade}
            size="lg"
            className="w-full"
          >
            <Vault className="w-5 h-5 mr-2" />
            Save to Vault — $5/mo
          </Button>

          <p className="text-sm text-muted-foreground">
            Save your review to the Vault. It locks for a year, then you'll
            get a magical reveal of what past-you wrote. ✨
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Phase 3: Stripe Integration

**Design Decision**: Using Stripe Payment Links instead of custom Checkout Sessions. This is the simplest possible implementation - just URLs you configure in the Stripe Dashboard.

#### 3.1 Stripe Setup (Dashboard Configuration)

1. Create a Product called "Annual Review Vault"
2. Create two Prices:
   - Monthly: $5/month recurring
   - Yearly: $50/year recurring
3. Create two Payment Links (one per price)
4. Configure Payment Links:
   - Enable "Allow promo codes" if wanted later
   - Set success URL: `https://yourdomain.com/dashboard?success=true`
   - Add custom field for user email (or use Stripe's email collection)
5. For subscription management, use Stripe's hosted Customer Portal (no custom code needed)

#### 3.2 Payment Link Configuration

```typescript
// lib/stripe/config.ts
export const STRIPE_CONFIG = {
  // These are Payment Link URLs from your Stripe Dashboard
  paymentLinks: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY!,  // https://buy.stripe.com/xxx
    yearly: process.env.NEXT_PUBLIC_STRIPE_LINK_YEARLY!,    // https://buy.stripe.com/yyy
  },
  // Customer portal link (from Stripe Dashboard > Settings > Customer Portal)
  customerPortal: process.env.NEXT_PUBLIC_STRIPE_PORTAL_LINK!,
}
```

#### 3.3 Webhook Handler

Still needed to sync subscription status to our database:

```typescript
// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerEmail = session.customer_details?.email
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (!customerEmail) break

      // Find user by email and upsert subscription
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users.users.find(u => u.email === customerEmail)

      if (!user) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        price_id: subscription.items.data[0].price.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' })

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status === 'active' ? 'active' : 'past_due',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_subscription_id', subscription.id)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)

      break
    }
  }

  return NextResponse.json({ received: true })
}
```

#### 3.4 Usage in Pricing Page

```typescript
// Simple link buttons - no API routes needed
<a href={STRIPE_CONFIG.paymentLinks.monthly}>
  Subscribe Monthly - $5/mo
</a>
<a href={STRIPE_CONFIG.paymentLinks.yearly}>
  Subscribe Yearly - $50/yr (Save $10)
</a>

// For billing management
<a href={STRIPE_CONFIG.customerPortal}>
  Manage Subscription
</a>
```

### Phase 4: Pricing Page

#### 4.1 Pricing Display

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Annual Review Vault                      │
│                                                             │
│      Complete your review for free, or unlock the Vault     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │                     │    │  ⭐ RECOMMENDED      │        │
│  │        FREE         │    │                     │        │
│  │                     │    │        VAULT        │        │
│  │        $0           │    │                     │        │
│  │                     │    │   $5/mo or $50/yr   │        │
│  │  ───────────────    │    │                     │        │
│  │                     │    │   ───────────────   │        │
│  │  ✓ All templates    │    │                     │        │
│  │  ✓ Full review      │    │   ✓ Everything free │        │
│  │  ✓ Download MD      │    │   ✓ Save progress   │        │
│  │                     │    │   ✓ Resume anytime  │        │
│  │  ✗ No save          │    │   ✓ Time capsule    │        │
│  │  ✗ No vault         │    │   ✓ Unlock ceremony │        │
│  │                     │    │   ✓ Multi-year      │        │
│  │                     │    │                     │        │
│  │  [Start for Free]   │    │  [Subscribe]        │        │
│  │                     │    │                     │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 5: Paid User Dashboard

Same as before, but now gated behind active subscription. Dashboard checks subscription status and shows appropriate UI.

```typescript
// app/(protected)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (subscription?.status !== 'active') {
    redirect('/pricing?upgrade=true')
  }

  // Fetch user's reviews and vaults...
  // Render dashboard
}
```

### Phase 6: Vault Unlock Ceremony

Same celebratory experience as before, only available to paid users.

---

## Technical Considerations

### Authentication & Authorization
- Free users: No auth required, localStorage only
- Paid users: Supabase Auth + subscription check in application layer
- RLS policies enforce user ownership (subscription check in app code for simplicity)

### Stripe Integration
- **Payment Links**: Pre-configured URLs from Stripe Dashboard (no custom checkout code)
- **Customer Portal**: Stripe's hosted portal for subscription management
- **Webhooks**: Only custom code needed - syncs subscription status to database

### Guest to Paid Migration
- Guest answers remain in localStorage throughout the session
- When user signs up + subscribes, dashboard checks localStorage for pending reviews
- Migration Server Action reads localStorage data and inserts into database
- localStorage cleared only after successful database write

```typescript
// Example migration flow in dashboard
'use server'
export async function migrateGuestReviews(guestData: GuestStorage) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  for (const [slug, review] of Object.entries(guestData.reviews)) {
    await supabase.from('annual_reviews').upsert({
      user_id: user.id,
      template_slug: slug,
      year: new Date().getFullYear(),
      status: 'draft',
      current_question_index: review.currentQuestionIndex,
      responses: review.responses,
    }, { onConflict: 'user_id,template_slug,year' })
  }
}
```

### Performance
- Templates defined in code (instant lookup, no DB query)
- Client-side markdown generation (no server round-trip)
- JSONB responses = single row read per review

---

## Acceptance Criteria

### Free Tier (Guest Flow)
- [ ] Anyone can browse templates without login
- [ ] Anyone can start and complete a full review
- [ ] Progress stored in localStorage (survives refresh within session)
- [ ] Completion screen offers markdown download
- [ ] Download generates properly formatted markdown file
- [ ] Upgrade CTA leads to signup flow

### Paid Tier (Vault)
- [ ] Pricing page shows both plans with Payment Links
- [ ] Successful payment activates subscription (via webhook)
- [ ] Dashboard only accessible with active subscription
- [ ] Progress auto-saves to database (JSONB responses)
- [ ] Can resume from any device
- [ ] Vault lock/unlock cycle: draft → locked → unlocked
- [ ] Subscription management via Stripe Customer Portal link

### Stripe Integration
- [ ] Payment Links redirect to Stripe checkout
- [ ] Webhook handler syncs subscription status
- [ ] Cancellation/past-due updates status appropriately

### Migration Flow
- [ ] Guest answers persist in localStorage through signup
- [ ] Dashboard detects localStorage data on first login
- [ ] Migration moves localStorage data to database
- [ ] localStorage cleared after successful migration

---

## MVP Scope

### In Scope (v1)
- **Free tier**: Complete review, download markdown
- **Paid tier**: $5/mo or $50/yr via Stripe Payment Links
- 3-5 initial review templates (code-defined)
- Template browser (public, no auth)
- Typeform-style one-question-at-a-time experience
- Markdown export (client-side generation)
- Stripe Payment Links + hosted Customer Portal
- Subscription-gated dashboard
- JSONB responses for simple data model
- 3-state vault: draft → locked → unlocked
- Mobile-responsive design
- Guest-to-paid migration via localStorage

### Out of Scope (Future)
- Admin UI for template management
- Social login (Google, GitHub)
- File/image uploads in responses
- Email notifications
- Year-over-year comparison view
- Team/family plans
- Gift subscriptions
- Promo codes
- Per-question analytics (would need normalized responses table)

---

## ERD Diagram

Simplified to 2 tables. Templates and questions are defined in TypeScript code.

```mermaid
erDiagram
    USERS ||--o| SUBSCRIPTIONS : has
    USERS ||--o{ ANNUAL_REVIEWS : has

    USERS {
        uuid id PK
        string email
        timestamp created_at
    }

    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK UK
        string stripe_customer_id
        string stripe_subscription_id
        string status
        string price_id
        timestamp current_period_start
        timestamp current_period_end
        boolean cancel_at_period_end
        timestamp created_at
    }

    ANNUAL_REVIEWS {
        uuid id PK
        uuid user_id FK
        string template_slug
        int year
        string status
        int current_question_index
        jsonb responses
        timestamp created_at
        timestamp updated_at
    }
```

**Note**: `template_slug` references code-defined templates (not a FK). `responses` is a JSONB object like `{"question_id": "answer_text", ...}`.

---

## References

### External Documentation
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Stripe Payment Links](https://stripe.com/docs/payment-links)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Framer Motion](https://www.framer.com/motion/)
- [Next.js 15 Breaking Changes](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

### Inspiration
- [Typeform](https://www.typeform.com/) - One question at a time UX
- [YearCompass](https://yearcompass.com/) - Annual reflection structure
- Time capsule apps - Vault locking mechanics
