'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ReviewTemplate } from '@/lib/templates/types'
import {
  getGuestReview,
  startGuestReview,
  saveGuestResponse,
  setQuestionIndex,
  setCurrentScreen,
  setReviewMode as saveReviewMode,
  completeGuestReview,
  flushStorage,
  type FlowScreen,
  type ReviewMode,
} from '@/lib/guest-storage'
import { TemplateIntro } from '@/components/templates/template-intro'
import { HenryIntro } from '@/components/templates/henry-intro'
import { HousekeepingPage } from '@/components/review/housekeeping-page'
import { HandwritingPage } from '@/components/review/handwriting-page'
import { CenteringPage } from '@/components/review/centering-page'
import { TypeformQuestion } from '@/components/review/typeform-question'
import { ReviewProgressBar } from '@/components/review/progress-bar'
import { LoadingState } from '@/components/ui/loading-state'

// Question IDs that are handled by the housekeeping page (not shown as individual questions)
const HOUSEKEEPING_QUESTION_IDS = [
  'prep-time-blocked',
  'prep-devices-away',
  'prep-quiet-space',
  'prep-materials',
  'prep-water',
  'prep-ready',
]

interface ReviewFlowProps {
  template: ReviewTemplate
  isAuthenticated?: boolean
}

export function ReviewFlow({ template, isAuthenticated = false }: ReviewFlowProps) {
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)
  const [showHousekeeping, setShowHousekeeping] = useState(false)
  const [showHandwritingPage, setShowHandwritingPage] = useState(false)
  const [showCenteringPage, setShowCenteringPage] = useState(false)
  const [reviewMode, setReviewMode] = useState<ReviewMode>('digital')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isClient, setIsClient] = useState(false)

  // For Henry's template, filter out housekeeping questions (they're on a separate page)
  const displayQuestions = useMemo(() => {
    if (template.slug === 'henry-finkelstein') {
      return template.questions.filter((q) => !HOUSEKEEPING_QUESTION_IDS.includes(q.id))
    }
    return template.questions
  }, [template])

  // Calculate section-specific progress (must be before early returns for hook order consistency)
  const sectionProgress = useMemo(() => {
    if (displayQuestions.length === 0) return null
    const currentQuestion = displayQuestions[currentIndex]
    if (!currentQuestion?.section) return null

    const currentSection = currentQuestion.section
    const sectionQuestions = displayQuestions.filter(q => q.section === currentSection)
    const sectionStartIndex = displayQuestions.findIndex(q => q.section === currentSection)
    const currentPositionInSection = currentIndex - sectionStartIndex + 1

    return {
      sectionName: currentSection,
      sectionCurrent: currentPositionInSection,
      sectionTotal: sectionQuestions.length,
    }
  }, [displayQuestions, currentIndex])

  // Initialize from localStorage
  useEffect(() => {
    setIsClient(true)
    const existingReview = getGuestReview(template.slug)
    if (existingReview) {
      setResponses(existingReview.responses)
      setCurrentIndex(existingReview.currentQuestionIndex)
      // Restore review mode
      if (existingReview.reviewMode) {
        setReviewMode(existingReview.reviewMode)
      }

      // Restore screen state
      const savedScreen = existingReview.currentScreen || 'intro'
      if (savedScreen === 'intro') {
        setShowIntro(true)
      } else if (savedScreen === 'housekeeping') {
        setShowIntro(false)
        setShowHousekeeping(true)
      } else if (savedScreen === 'handwriting') {
        setShowIntro(false)
        setShowHandwritingPage(true)
      } else if (savedScreen === 'centering') {
        setShowIntro(false)
        setShowCenteringPage(true)
      } else if (savedScreen === 'questions') {
        setShowIntro(false)
      }
    }
  }, [template.slug])

  const handleStart = useCallback(() => {
    const existing = getGuestReview(template.slug)
    if (!existing) {
      startGuestReview(template.slug)
    }
    setShowIntro(false)
    // For Henry's template, show housekeeping page next
    if (template.slug === 'henry-finkelstein') {
      setShowHousekeeping(true)
      setCurrentScreen(template.slug, 'housekeeping')
    } else {
      setCurrentScreen(template.slug, 'questions')
    }
  }, [template.slug])

  const handleHousekeepingComplete = useCallback(
    (housekeepingResponses: Record<string, string>) => {
      // Save housekeeping responses (convert done/skipped to string values)
      Object.entries(housekeepingResponses).forEach(([id, value]) => {
        const questionId = `prep-${id}`
        saveGuestResponse(template.slug, questionId, value)
        setResponses((prev) => ({ ...prev, [questionId]: value }))
      })
      setShowHousekeeping(false)
      // For Henry's template, show handwriting page next
      if (template.slug === 'henry-finkelstein') {
        setShowHandwritingPage(true)
        setCurrentScreen(template.slug, 'handwriting')
      }
    },
    [template.slug]
  )

  const handleHandwritingModeSelect = useCallback(
    (mode: ReviewMode) => {
      setReviewMode(mode)
      saveReviewMode(template.slug, mode)
      setShowHandwritingPage(false)
      // Show centering page next for Henry's template
      if (template.slug === 'henry-finkelstein') {
        setShowCenteringPage(true)
        setCurrentScreen(template.slug, 'centering')
      }
    },
    [template.slug]
  )

  const handleCenteringComplete = useCallback(() => {
    setShowCenteringPage(false)
    setCurrentScreen(template.slug, 'questions')
  }, [template.slug])

  const handleResponseChange = useCallback(
    (value: string) => {
      const questionId = displayQuestions[currentIndex].id
      setResponses((prev) => ({ ...prev, [questionId]: value }))
      saveGuestResponse(template.slug, questionId, value)
    },
    [template.slug, displayQuestions, currentIndex]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < displayQuestions.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setQuestionIndex(template.slug, newIndex)
    } else {
      // Complete the review and flush storage before navigation
      completeGuestReview(template.slug)
      flushStorage()
      router.push(`/review/${template.slug}/complete`)
    }
  }, [template.slug, displayQuestions, currentIndex, router])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setQuestionIndex(template.slug, newIndex)
    }
  }, [currentIndex, template.slug])

  // Consolidated keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events on the intro, housekeeping, handwriting, or centering screen
      if (showIntro || showHousekeeping || showHandwritingPage || showCenteringPage) return

      const currentQuestion = displayQuestions[currentIndex]
      const currentValue = responses[currentQuestion.id] || ''
      // In handwriting mode, can always proceed
      const canProceed = reviewMode === 'handwriting' || !currentQuestion.required || currentValue.trim().length > 0

      // Handle Enter key (proceed to next question)
      if (e.key === 'Enter') {
        // In handwriting mode, Enter always proceeds
        if (reviewMode === 'handwriting') {
          e.preventDefault()
          handleNext()
        }
        // For textarea in digital mode: only proceed with Cmd/Ctrl + Enter
        else if (currentQuestion.type === 'textarea') {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            if (canProceed) {
              handleNext()
            }
          }
        } else {
          // For other input types: Enter without Shift
          if (!e.shiftKey) {
            e.preventDefault()
            if (canProceed) {
              handleNext()
            }
          }
        }
      }

      // Handle arrow keys and page up/down (navigation)
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        if (canProceed) {
          handleNext()
        }
      }

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        handlePrevious()
      }

      // Handle Escape (go back to intro)
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowIntro(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showIntro, showHousekeeping, showHandwritingPage, showCenteringPage, reviewMode, currentIndex, displayQuestions, responses, handleNext, handlePrevious])

  // Don't render anything until client-side (localStorage access requires client)
  if (!isClient) {
    return <LoadingState />
  }

  if (showIntro) {
    // Use custom intro for Henry's template
    if (template.slug === 'henry-finkelstein') {
      return (
        <HenryIntro
          template={template}
          onStart={handleStart}
          hasExistingProgress={Object.keys(responses).length > 0}
          isAuthenticated={isAuthenticated}
        />
      )
    }

    return (
      <TemplateIntro
        template={template}
        onStart={handleStart}
        hasExistingProgress={Object.keys(responses).length > 0}
        isAuthenticated={isAuthenticated}
      />
    )
  }

  // Show housekeeping page for Henry's template
  if (showHousekeeping) {
    return <HousekeepingPage onComplete={handleHousekeepingComplete} />
  }

  // Show handwriting mode selection page for Henry's template
  if (showHandwritingPage) {
    return <HandwritingPage onContinue={handleHandwritingModeSelect} />
  }

  // Show centering page for Henry's template
  if (showCenteringPage) {
    return <CenteringPage onBegin={handleCenteringComplete} />
  }

  const currentQuestion = displayQuestions[currentIndex]
  const currentValue = responses[currentQuestion.id] || ''

  return (
    <>
      <ReviewProgressBar
        current={currentIndex + 1}
        total={displayQuestions.length}
        templateName={template.name}
        sectionName={sectionProgress?.sectionName}
        sectionCurrent={sectionProgress?.sectionCurrent}
        sectionTotal={sectionProgress?.sectionTotal}
      />
      <TypeformQuestion
        question={currentQuestion}
        value={currentValue}
        onChange={handleResponseChange}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentIndex === 0}
        isLast={currentIndex === displayQuestions.length - 1}
        questionNumber={currentIndex + 1}
        totalQuestions={displayQuestions.length}
        mode={reviewMode}
      />
    </>
  )
}
