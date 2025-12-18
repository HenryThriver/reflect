# feat: Add Terms of Service and Privacy Policy Pages

## Overview

Create boilerplate Terms of Service and Privacy Policy pages for the Annual Review Vault B2C subscription product. These pages are required for Google OAuth consent screen configuration.

## Standard URLs (for Google OAuth setup)

- **Terms of Service**: `/terms`
- **Privacy Policy**: `/privacy`

Both URLs will be publicly accessible, static pages with no authentication required.

## Acceptance Criteria

- [ ] `/terms` page exists and is publicly accessible
- [ ] `/privacy` page exists and is publicly accessible
- [ ] Both pages follow existing styling patterns (`max-w-4xl mx-auto`, Tailwind)
- [ ] Pages include "Last Updated" date at the top
- [ ] Pages have proper metadata (title, description)
- [ ] Footer component created with links to both pages
- [ ] Footer added to relevant layouts (public pages, auth pages)

## Implementation

### 1. Create Privacy Policy Page

**File**: `src/app/(public)/privacy/page.tsx`

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Annual Review Vault',
  description: 'How Annual Review Vault collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 17, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Content sections */}
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:underline">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### 2. Create Terms of Service Page

**File**: `src/app/(public)/terms/page.tsx`

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Annual Review Vault',
  description: 'Terms and conditions for using Annual Review Vault.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 17, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Content sections */}
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:underline">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### 3. Create Footer Component

**File**: `src/components/marketing/footer.tsx`

```tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Annual Review Vault</p>
          <nav className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
```

### 4. Add Footer to Layouts

Add footer to:
- `src/app/(public)/templates/page.tsx` (or create a shared layout)
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- Consider creating `src/app/(public)/layout.tsx` if it doesn't exist

## Boilerplate Content

### Privacy Policy Sections

1. **Introduction** - What the policy covers
2. **Information We Collect** - Account info (email, name via Google OAuth), usage data, localStorage data
3. **How We Use Your Information** - Service delivery, account management, communication
4. **Third-Party Services** - Google OAuth, Supabase (database), Stripe (payments), Vercel (hosting)
5. **Data Storage and Security** - How data is protected
6. **Your Rights** - Access, correction, deletion requests
7. **Cookies and Local Storage** - What's stored locally
8. **Children's Privacy** - 18+ service
9. **Changes to This Policy** - How updates are communicated
10. **Contact Us** - Email for privacy inquiries

### Terms of Service Sections

1. **Acceptance of Terms** - Using service = agreement
2. **Description of Service** - Annual review tool with templates
3. **Account Registration** - Requirements for accounts
4. **Subscription and Billing** - Pricing, billing cycle, auto-renewal
5. **Cancellation and Refunds** - How to cancel, refund policy
6. **Acceptable Use** - Prohibited activities
7. **Intellectual Property** - Who owns what
8. **User Content** - Ownership of reviews created
9. **Disclaimer of Warranties** - "AS IS" service
10. **Limitation of Liability** - Liability caps
11. **Governing Law** - Jurisdiction
12. **Changes to Terms** - How updates work
13. **Contact Information** - Support email

## Notes for Google OAuth Setup

When configuring Google OAuth consent screen:

1. **Privacy Policy URL**: `https://[your-domain]/privacy`
2. **Terms of Service URL**: `https://[your-domain]/terms`

Both must be:
- On the same domain as your app
- Publicly accessible (no auth required)
- Linked from your homepage/footer

## References

- Existing page patterns: `src/app/(public)/pricing/page.tsx`
- Styling patterns: `max-w-4xl mx-auto`, `text-muted-foreground`
- shadcn/ui components in `src/components/ui/`
