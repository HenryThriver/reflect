'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ReviewTemplate } from '@/lib/templates/types'
import { Button } from '@/components/ui/button'
import { Clock, ListChecks, ArrowRight, LogIn, User } from 'lucide-react'
import { GuestWarningModal } from '@/components/auth/guest-warning-modal'

interface HenryIntroProps {
  template: ReviewTemplate
  onStart: () => void
  hasExistingProgress?: boolean
  isAuthenticated?: boolean
}

export function HenryIntro({
  template,
  onStart,
  hasExistingProgress,
  isAuthenticated = false,
}: HenryIntroProps) {
  const router = useRouter()
  const [showGuestWarning, setShowGuestWarning] = useState(false)

  const handleLogin = (): void => {
    router.push(`/login?redirectTo=/review/${template.slug}`)
  }

  const handleGuestConfirm = (): void => {
    setShowGuestWarning(false)
    onStart()
  }

  const handleCreateAccount = (): void => {
    router.push(`/signup?redirectTo=/review/${template.slug}`)
  }

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Photo */}
        <div className="lg:w-1/2 relative h-[40vh] lg:h-screen">
          <Image
            src="/images/henry-headshot.jpg"
            alt="Henry Finkelstein"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Subtle gradient overlay for text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 lg:bg-gradient-to-r lg:from-transparent lg:to-background/20" />
        </div>

        {/* Right side - Letter */}
        <div className="lg:w-1/2 flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-20 bg-background">
          <div className="max-w-xl mx-auto lg:mx-0">
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              Henry Finkelstein&apos;s Annual Review
            </h1>

            {/* The Letter */}
            <div className="prose prose-lg dark:prose-invert mb-10">
              <p className="text-xl leading-relaxed mb-6">
                Hello and welcome! I&apos;m Henry.
              </p>
              <p className="leading-relaxed mb-6">
                You&apos;re about to do something most people never make time for: honestly evaluating themselves to anchor peace and clarity.
              </p>
              <p className="leading-relaxed mb-6">
                This isn&apos;t about grades or performance reviews. It&apos;s about attention - the rare gift of turning toward your own life with curiosity instead of judgment.
              </p>
              <p className="leading-relaxed mb-6">
                I&apos;ve been doing annual reviews for years, and I&apos;ve borrowed from the best: Dr. Anthony Gustin, Tiago Forte, Anne-Laure Le Cunff, TK Krader, and Sahil Bloom. I&apos;ve compiled the questions and the flow that yield the best outcomes for me. I hope it serves you on your path.
              </p>
              <p className="leading-relaxed mb-6">
                Find a quiet space. Pour yourself something warm. Give yourself permission to go slow.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Take a breath. When you&apos;re ready, begin.
              </p>
            </div>

            {/* Stats - subtle */}
            <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>3-5 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <span>100+ questions</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <Button size="lg" onClick={onStart} className="text-lg px-8 w-full sm:w-auto">
                    {hasExistingProgress ? 'Continue Review' : 'Begin'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  {hasExistingProgress && (
                    <p className="text-sm text-muted-foreground">
                      You have progress saved. Pick up where you left off.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" onClick={handleLogin} className="text-lg px-8">
                      <LogIn className="mr-2 h-5 w-5" />
                      Login to Save
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setShowGuestWarning(true)}
                      className="text-lg px-8"
                    >
                      <User className="mr-2 h-5 w-5" />
                      {hasExistingProgress ? 'Continue as Guest' : 'Start as Guest'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Free accounts save your progress across devices
                  </p>
                  {hasExistingProgress && (
                    <p className="text-sm text-muted-foreground">
                      You have guest progress saved in this browser.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <GuestWarningModal
        open={showGuestWarning}
        onConfirm={handleGuestConfirm}
        onCreateAccount={handleCreateAccount}
      />
    </>
  )
}
