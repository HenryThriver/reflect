'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import { TwitterShareButton } from 'react-share'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Download,
  Sparkles,
  Cloud,
  History,
  AlertCircle,
  Share2,
  Check,
  Twitter,
  Linkedin,
} from 'lucide-react'
import { getGuestReview } from '@/lib/guest-storage'
import { generateMarkdown, downloadMarkdown } from '@/lib/markdown/generator'
import { VALUE_FOREST_QUESTION_COUNT } from '@/lib/value-trees/constants'
import { checkoutWithStripe } from '@/lib/stripe/actions'
import type { ReviewTemplate } from '@/lib/templates/types'

// ============================================
// CONSTANTS
// ============================================

const VAULT_CLOSE_DATE = 'January 11'

function getNextVaultOpenDate(): string {
  const now = new Date()
  const currentYear = now.getFullYear()

  // If we're in Jan 1-11, next open is Dec 12 of THIS year
  // Otherwise, next open is Dec 12 of NEXT year
  const nextOpenYear =
    now.getMonth() === 0 && now.getDate() <= 11 ? currentYear : currentYear + 1

  return `December 12, ${nextOpenYear}`
}

function getNextCheckinDate(): Date {
  const now = new Date()
  const year = now.getFullYear()

  // Check-in dates: Apr 1, Jul 1, Oct 1, Jan 1
  const checkinDates = [
    new Date(year, 3, 1), // Post-Q1: April 1
    new Date(year, 6, 1), // Post-Q2: July 1
    new Date(year, 9, 1), // Post-Q3: October 1
    new Date(year + 1, 0, 1), // Post-Q4: January 1 (next year)
  ]

  for (const date of checkinDates) {
    if (date > now) return date
  }

  // If past all, return next year's April 1
  return new Date(year + 1, 3, 1)
}

// ============================================
// MAIN COMPONENT
// ============================================

interface CompletionPageClientProps {
  templateSlug: string
  template: ReviewTemplate
  hasSubscription: boolean
}

export function CompletionPageClient({
  templateSlug,
  template,
  hasSubscription,
}: CompletionPageClientProps) {
  const searchParams = useSearchParams()
  const [guestReview, setGuestReview] =
    useState<ReturnType<typeof getGuestReview>>(null)
  const [isClient, setIsClient] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 })
  const [shareText, setShareText] = useState('')
  const [copied, setCopied] = useState(false)

  const error = searchParams.get('error')
  const errorMessages: Record<string, string> = {
    checkout_failed: 'Unable to start checkout. Please try again.',
    no_email: 'Your account needs an email address to subscribe.',
    config_error: 'Service temporarily unavailable. Please try again later.',
    database_error: 'Something went wrong. Please try again.',
  }

  // Calculate question stats
  const responses = guestReview?.responses ?? {}
  const answeredCount = Object.values(responses).filter((r) => r.trim()).length
  const isHenryTemplate = template.slug === 'henry-finkelstein'
  const totalQuestions = isHenryTemplate
    ? template.questions.length + VALUE_FOREST_QUESTION_COUNT
    : template.questions.length

  // Initialize
  useEffect(() => {
    setIsClient(true)
    setGuestReview(getGuestReview(templateSlug))

    // Fire confetti once on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      gravity: 0.5,
      decay: 0.94,
      ticks: 200,
    })

    // Set initial share text
    const year = new Date().getFullYear()
    setShareText(
      `I just completed my ${year} annual review. ${totalQuestions}+ questions. Absolutely worth it.`
    )
  }, [templateSlug, totalQuestions])

  // Countdown timer for Q1 check-in
  useEffect(() => {
    const updateCountdown = () => {
      const target = getNextCheckinDate().getTime()
      const now = Date.now()
      const diff = Math.max(0, target - now)

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Handlers
  const handleDownload = () => {
    if (!guestReview) return
    const markdown = generateMarkdown(
      template,
      guestReview.responses,
      new Date()
    )
    const year = new Date().getFullYear()
    downloadMarkdown(markdown, `${template.slug}-${year}.md`)
  }

  const handleCopyForLinkedIn = async () => {
    const shareUrl = `${process.env.NEXT_PUBLIC_URL}/review/${templateSlug}`
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = `${shareText}\n\n${shareUrl}`
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isClient) {
    return <LoadingState />
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_URL}/review/${templateSlug}`

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* ========== SECTION 1: Celebration Hero ========== */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">You did it.</h1>
          <p className="text-lg text-muted-foreground">
            This took courage. You just did something most people never do.
          </p>
          <p className="text-sm text-muted-foreground">
            You answered {answeredCount} of {totalQuestions} questions.
          </p>
        </div>

        {/* ========== SECTION 2: Download CTA ========== */}
        <div className="space-y-4">
          <Button onClick={handleDownload} size="lg" className="w-full">
            <Download className="w-5 h-5 mr-2" />
            Download as Markdown
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            The vault closes {VAULT_CLOSE_DATE}. Download your answers to keep
            them forever — or wait until {getNextVaultOpenDate()} to see them
            again.
          </p>
        </div>

        {/* ========== SECTION 3: Grove Upsell ========== */}
        {error && errorMessages[error] && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessages[error]}</span>
          </div>
        )}

        {hasSubscription ? (
          // Subscriber view
          <div className="text-center space-y-4 p-6 bg-muted/50 rounded-lg">
            <Sparkles className="w-8 h-8 mx-auto text-purple-500" />
            <h2 className="text-xl font-semibold">You&apos;re in The Grove</h2>
            <p className="text-muted-foreground">
              Your Q1 check-in opens in {countdown.days} days, {countdown.hours}{' '}
              hours
            </p>
          </div>
        ) : (
          // Non-subscriber upsell
          <div className="space-y-6 p-6 border rounded-lg">
            <div className="text-center space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-purple-500" />
              <h2 className="text-xl font-semibold">Continue with The Grove</h2>
              <p className="text-muted-foreground">
                Quarterly check-ins that pull from your annual review to keep
                you aligned with what matters.
              </p>
              <p className="text-sm text-purple-600 font-medium">
                Your Q1 check-in opens in {countdown.days} days,{' '}
                {countdown.hours} hours
              </p>
            </div>

            <div className="flex gap-3">
              <form action={checkoutWithStripe} className="flex-1">
                <input type="hidden" name="priceType" value="monthly" />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/review/${templateSlug}/complete`}
                />
                <Button type="submit" variant="outline" className="w-full">
                  $5/month
                </Button>
              </form>

              <form action={checkoutWithStripe} className="flex-1">
                <input type="hidden" name="priceType" value="yearly" />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/review/${templateSlug}/complete`}
                />
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
        )}

        {/* ========== SECTION 4: Social Sharing ========== */}
        <div className="flex justify-center">
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
                <Textarea
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  rows={3}
                  placeholder="Customize your message..."
                />

                <div className="flex gap-3">
                  <TwitterShareButton url={shareUrl} title={shareText}>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Twitter className="w-4 h-4" />
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
                        <Linkedin className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  )
}
