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
import { ValueForestSection } from '@/components/review/value-trees'
import { VisualizationPage } from '@/components/review/visualization-page'
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

// Section 4 is handled by the Value Forest component (not shown as individual questions)
const VALUE_FOREST_SECTION = '4) Value Forest'

// The visualization question ID that triggers the visualization intro page
const VISUALIZATION_QUESTION_ID = 'future-self-message'

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
  const [showValueForest, setShowValueForest] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [reviewMode, setReviewMode] = useState<ReviewMode>('digital')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isClient, setIsClient] = useState(false)

  // For Henry's template, filter out housekeeping questions and Section 5 (Value Forest)
  // These are handled by separate components
  const displayQuestions = useMemo(() => {
    if (template.slug === 'henry-finkelstein') {
      return template.questions.filter(
        (q) => !HOUSEKEEPING_QUESTION_IDS.includes(q.id) && q.section !== VALUE_FOREST_SECTION
      )
    }
    return template.questions
  }, [template])

  // Find the index in displayQuestions where Value Forest (Section 4) should be shown
  // This is after Section 3 (Synthesize) ends and before Section 5 (Restore) begins
  const section5StartIndex = useMemo(() => {
    if (template.slug !== 'henry-finkelstein') return -1
    // Find the first question in Section 5 (Restore) within displayQuestions
    // Value Forest should appear right before this
    const firstRestoreIndex = displayQuestions.findIndex(
      (q) => q.section === '5) Restore'
    )
    // If found, return that index. If not found, return -1 (shouldn't happen)
    return firstRestoreIndex
  }, [template.slug, displayQuestions])

  // Find the index of the visualization question (future-self-message) in displayQuestions
  const visualizationQuestionIndex = useMemo(() => {
    if (template.slug !== 'henry-finkelstein') return -1
    return displayQuestions.findIndex((q) => q.id === VISUALIZATION_QUESTION_ID)
  }, [template.slug, displayQuestions])

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
      } else if (savedScreen === 'value-forest') {
        setShowIntro(false)
        setShowValueForest(true)
      } else if (savedScreen === 'visualization') {
        setShowIntro(false)
        setShowVisualization(true)
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

  const handleValueForestComplete = useCallback(() => {
    setShowValueForest(false)
    // Continue to the questions after Section 5 (Section 6+)
    // currentIndex is already at section5StartIndex, so just move forward
    setCurrentScreen(template.slug, 'questions')
  }, [template.slug])

  const handleValueForestBack = useCallback(() => {
    // Exit Value Forest and go back to the last Section 4 question
    setShowValueForest(false)
    const newIndex = section5StartIndex - 1
    setCurrentIndex(newIndex)
    setQuestionIndex(template.slug, newIndex)
    setCurrentScreen(template.slug, 'questions')
  }, [template.slug, section5StartIndex])

  const handleVisualizationComplete = useCallback(() => {
    setShowVisualization(false)
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

      // Check if we're entering Section 5 (Value Forest) for Henry's template
      if (template.slug === 'henry-finkelstein' && newIndex === section5StartIndex) {
        setShowValueForest(true)
        setCurrentScreen(template.slug, 'value-forest')
        setCurrentIndex(newIndex)
        setQuestionIndex(template.slug, newIndex)
        return
      }

      // Check if we're entering the visualization question for Henry's template
      if (template.slug === 'henry-finkelstein' && newIndex === visualizationQuestionIndex) {
        setShowVisualization(true)
        setCurrentScreen(template.slug, 'visualization')
        setCurrentIndex(newIndex)
        setQuestionIndex(template.slug, newIndex)
        return
      }

      setCurrentIndex(newIndex)
      setQuestionIndex(template.slug, newIndex)
    } else {
      // Complete the review and flush storage before navigation
      completeGuestReview(template.slug)
      flushStorage()
      router.push(`/review/${template.slug}/complete`)
    }
  }, [template.slug, displayQuestions, currentIndex, router, section5StartIndex, visualizationQuestionIndex])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      // Check if we're at the first question after Section 5 (Value Forest) for Henry's template
      // Going back should enter the Value Forest section
      if (template.slug === 'henry-finkelstein' && currentIndex === section5StartIndex) {
        setShowValueForest(true)
        setCurrentScreen(template.slug, 'value-forest')
        return
      }

      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setQuestionIndex(template.slug, newIndex)
    }
  }, [currentIndex, template.slug, section5StartIndex])

  // Consolidated keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events on special screens (they have their own handlers)
      if (showIntro || showHousekeeping || showHandwritingPage || showCenteringPage || showValueForest || showVisualization) return

      const currentQuestion = displayQuestions[currentIndex]
      // Users can always proceed - no required field validation
      const canProceed = true

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
  }, [showIntro, showHousekeeping, showHandwritingPage, showCenteringPage, showValueForest, showVisualization, reviewMode, currentIndex, displayQuestions, handleNext, handlePrevious])

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

  // Show Value Forest for Henry's template (Section 5)
  if (showValueForest) {
    return (
      <ValueForestSection
        templateSlug={template.slug}
        mode={reviewMode}
        onComplete={handleValueForestComplete}
        onBack={handleValueForestBack}
      />
    )
  }

  // Show Visualization intro for Henry's template (Section 7)
  if (showVisualization) {
    return <VisualizationPage onBegin={handleVisualizationComplete} />
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
