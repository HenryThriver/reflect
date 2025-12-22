'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import { TwitterShareButton } from 'react-share'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { BlurFade } from '@/components/ui/blur-fade'
import { ShineBorder } from '@/components/ui/shine-border'
import {
  Download,
  Cloud,
  History,
  AlertCircle,
  Twitter,
  Linkedin,
  TreeDeciduous,
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
  const nextOpenYear =
    now.getMonth() === 0 && now.getDate() <= 11 ? currentYear : currentYear + 1
  return `December ${nextOpenYear}`
}

function getNextQ1CheckinDate(): Date {
  const now = new Date()
  const year = now.getFullYear()
  // Q1 check-in is March 24
  // If we're past March 24 this year, return next year's March 24
  const thisYearQ1 = new Date(year, 2, 24) // March 24
  if (thisYearQ1 > now) {
    return thisYearQ1
  }
  return new Date(year + 1, 2, 24) // Next year March 24
}

// ============================================
// COUNTDOWN DISPLAY COMPONENT
// ============================================

interface CountdownDisplayProps {
  countdown: { days: number; hours: number; minutes: number; seconds: number }
  size?: 'sm' | 'lg'
}

function CountdownDisplay({ countdown, size = 'lg' }: CountdownDisplayProps) {
  const isLarge = size === 'lg'
  const containerClass = isLarge
    ? 'flex justify-center gap-3 font-mono text-lg'
    : 'flex justify-center gap-2 font-mono text-sm'
  const itemClass = isLarge
    ? 'bg-background/50 rounded-lg px-3 py-2'
    : 'bg-muted rounded px-2 py-1'

  return (
    <div className={containerClass}>
      <div className={itemClass}>
        <span className="font-bold text-foreground">{countdown.days}</span>
        <span className="text-xs text-muted-foreground ml-1">d</span>
      </div>
      <div className={itemClass}>
        <span className="font-bold text-foreground">{countdown.hours.toString().padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground ml-1">h</span>
      </div>
      <div className={itemClass}>
        <span className="font-bold text-foreground">{countdown.minutes.toString().padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground ml-1">m</span>
      </div>
      <div className={itemClass}>
        <span className="font-bold text-foreground">{countdown.seconds.toString().padStart(2, '0')}</span>
        <span className="text-xs text-muted-foreground ml-1">s</span>
      </div>
    </div>
  )
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
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const error = searchParams.get('error')
  const errorMessages: Record<string, string> = {
    checkout_failed: 'Unable to start checkout. Please try again.',
    no_email: 'Your account needs an email address to subscribe.',
    config_error: 'Service temporarily unavailable. Please try again later.',
    database_error: 'Something went wrong. Please try again.',
  }

  const responses = guestReview?.responses ?? {}
  const answeredCount = Object.values(responses).filter((r) => r.trim()).length
  const isHenryTemplate = template.slug === 'henry-finkelstein'
  const totalQuestions = isHenryTemplate
    ? template.questions.length + VALUE_FOREST_QUESTION_COUNT
    : template.questions.length

  const year = new Date().getFullYear()
  const shareText = `I just completed my ${year} annual review. ${totalQuestions} questions. Absolutely worth it.`

  const shareUrl = 'https://reflect.thrivinghenry.com'

  useEffect(() => {
    setIsClient(true)
    setGuestReview(getGuestReview(templateSlug))

    // Celebratory confetti
    const duration = 2000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#a855f7', '#ec4899', '#f59e0b'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#a855f7', '#ec4899', '#f59e0b'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [templateSlug])

  useEffect(() => {
    const updateCountdown = () => {
      const target = getNextQ1CheckinDate().getTime()
      const now = Date.now()
      const diff = Math.max(0, target - now)
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDownload = () => {
    if (!guestReview) return
    const markdown = generateMarkdown(
      template,
      guestReview.responses,
      new Date()
    )
    downloadMarkdown(markdown, `${template.slug}-${year}.md`)
  }

  if (!isClient) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-10">
        {/* ========== SECTION 1: Celebration Hero ========== */}
        <BlurFade delay={0}>
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Well done!
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-foreground/90">
              Your Annual Review took courage.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.1}>
          <p className="text-lg text-muted-foreground text-center">
            This document is a gift to your future self.
          </p>
        </BlurFade>

        <BlurFade delay={0.15}>
          <p className="text-sm text-muted-foreground text-center">
            You answered{' '}
            <span className="font-semibold text-foreground">{answeredCount}</span> of{' '}
            <span className="font-semibold text-foreground">{totalQuestions}</span> questions.
          </p>
        </BlurFade>

        {/* ========== SECTION 2: Download CTA ========== */}
        <BlurFade delay={0.2}>
          <div className="space-y-4">
            <Button
              onClick={handleDownload}
              size="lg"
              className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="w-5 h-5 mr-2" />
              Download as Markdown
            </Button>

            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Download your answers to keep them forever. Or wait until{' '}
              <span className="font-medium text-foreground">{getNextVaultOpenDate()}</span>{' '}
              to rediscover them with fresh eyes.
            </p>

            <p className="text-xs text-muted-foreground/70 text-center">
              The vault closes {VAULT_CLOSE_DATE}.
            </p>
          </div>
        </BlurFade>

        {/* ========== SECTION 3: Grove Upsell ========== */}
        {error && errorMessages[error] && (
          <BlurFade delay={0.25}>
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessages[error]}</span>
            </div>
          </BlurFade>
        )}

        <BlurFade delay={0.3}>
          {hasSubscription ? (
            <div className="text-center space-y-4 p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              <TreeDeciduous className="w-10 h-10 mx-auto text-purple-500" />
              <h2 className="text-xl font-semibold">You&apos;re in The Grove</h2>
              <p className="text-muted-foreground mb-4">
                Your Q1 check-in opens in:
              </p>
              <CountdownDisplay countdown={countdown} size="lg" />
            </div>
          ) : (
            <ShineBorder
              shineColor={['#a855f7', '#ec4899', '#f59e0b']}
              borderWidth={2}
              duration={10}
              className="rounded-xl"
            >
              <div className="space-y-6 p-8 bg-card rounded-xl">
                <div className="text-center space-y-4">
                  <TreeDeciduous className="w-10 h-10 mx-auto text-purple-500" />
                  <h2 className="text-xl font-semibold">Continue with The Grove</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The Annual Review will always be free. To deepen your life tending
                    and support this project, join The Grove.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The Grove is your curated collection of reflections and practices
                    to facilitate Thriving. Next up: a shorter, more targeted quarterly
                    check-in that pulls from your annual review, keeping you focused and
                    aligned with what matters most.
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    The Grove will continue to grow with you. Sign up now to plant your seeds.
                  </p>
                </div>

                {/* Countdown */}
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">Q1 check-in opens in:</p>
                  <CountdownDisplay countdown={countdown} size="sm" />
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
            </ShineBorder>
          )}
        </BlurFade>

        {/* ========== SECTION 4: Social Sharing ========== */}
        <BlurFade delay={0.35}>
          <div className="text-center space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Be proud of your review & let others know!
            </p>
            <div className="flex justify-center gap-4">
              <TwitterShareButton url={shareUrl} title={shareText}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                  <Twitter className="w-5 h-5" />
                  <span className="text-sm font-medium">Share on X</span>
                </div>
              </TwitterShareButton>

              <a
                href={`https://www.linkedin.com/feed/?shareActive=true&mini=true&text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <Linkedin className="w-5 h-5" />
                <span className="text-sm font-medium">Share on LinkedIn</span>
              </a>
            </div>
          </div>
        </BlurFade>

      </div>
    </div>
  )
}
