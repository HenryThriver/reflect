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
  flushAuthenticatedStorage,
  saveAuthenticatedReview,
  loadAuthenticatedReview,
  startAuthenticatedReview,
  updateAuthenticatedProgress,
  type ReviewMode,
} from '@/lib/guest-storage'
import { VALUE_FOREST_QUESTION_COUNT } from '@/lib/value-trees/constants'
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

// Helper to compute effective question index for database tracking
// For questions after Value Forest, adds the VALUE_FOREST_QUESTION_COUNT offset
function getEffectiveIndex(rawIndex: number, section5StartIndex: number, isHenryTemplate: boolean): number {
  if (!isHenryTemplate) return rawIndex
  // If we're past where Value Forest starts, add the offset
  if (rawIndex >= section5StartIndex) {
    return rawIndex + VALUE_FOREST_QUESTION_COUNT
  }
  return rawIndex
}

interface ReviewFlowProps {
  template: ReviewTemplate
  user?: { id: string } | null
}

// Screen state as discriminated union instead of multiple booleans
type ScreenState =
  | { screen: 'intro' }
  | { screen: 'housekeeping' }
  | { screen: 'handwriting' }
  | { screen: 'centering' }
  | { screen: 'questions' }
  | { screen: 'value-forest' }
  | { screen: 'visualization' }

export function ReviewFlow({ template, user }: ReviewFlowProps) {
  const router = useRouter()
  const [screenState, setScreenState] = useState<ScreenState>({ screen: 'intro' })
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

  // Initialize from database (authenticated) or localStorage (guest)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional SSR hydration pattern
    setIsClient(true)

    async function loadReview() {
      // Try database first for authenticated users
      if (user?.id) {
        const dbReview = await loadAuthenticatedReview(
          user.id,
          template.slug,
          template.year
        )
        if (dbReview) {
          setResponses(dbReview.responses)
          setCurrentIndex(dbReview.currentQuestionIndex)
          setReviewMode(dbReview.reviewMode ?? 'digital')

          if (dbReview.currentQuestionIndex > 0 || (dbReview.responses && Object.keys(dbReview.responses).length > 0)) {
            setScreenState({ screen: 'questions' })
          }
          return
        }
      }

      // Fall back to localStorage for guests (or if no DB data found)
      const existingReview = getGuestReview(template.slug)
      if (existingReview) {
        setResponses(existingReview.responses)
        setCurrentIndex(existingReview.currentQuestionIndex)
        // Restore review mode
        if (existingReview.reviewMode) {
          setReviewMode(existingReview.reviewMode)
        }

        // Restore screen state - FlowScreen and ScreenState.screen are compatible
        const savedScreen = existingReview.currentScreen || 'intro'
        if (savedScreen !== 'intro') {
          setScreenState({ screen: savedScreen })
        }
        // 'intro' is already the default state
      }
    }

    loadReview()
  }, [template.slug, user?.id])

  const handleStart = useCallback(() => {
    const existing = getGuestReview(template.slug)
    if (!existing) {
      startGuestReview(template.slug)
    }
    // For Henry's template, show housekeeping page next
    if (template.slug === 'henry-finkelstein') {
      setScreenState({ screen: 'housekeeping' })
      setCurrentScreen(template.slug, 'housekeeping')
    } else {
      setScreenState({ screen: 'questions' })
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
      // For Henry's template, show handwriting page next
      if (template.slug === 'henry-finkelstein') {
        setScreenState({ screen: 'handwriting' })
        setCurrentScreen(template.slug, 'handwriting')
      }
    },
    [template.slug]
  )

  const handleHandwritingModeSelect = useCallback(
    (mode: ReviewMode) => {
      setReviewMode(mode)
      saveReviewMode(template.slug, mode)

      // Create database record for authenticated users when they select a mode
      if (user?.id) {
        startAuthenticatedReview(
          user.id,
          template.slug,
          template.year,
          mode
        )
      }

      // Show centering page next for Henry's template
      if (template.slug === 'henry-finkelstein') {
        setScreenState({ screen: 'centering' })
        setCurrentScreen(template.slug, 'centering')
      }
    },
    [template.slug, user]
  )

  const handleCenteringComplete = useCallback(() => {
    setScreenState({ screen: 'questions' })
    setCurrentScreen(template.slug, 'questions')
  }, [template.slug])

  const handleValueForestComplete = useCallback(() => {
    setScreenState({ screen: 'questions' })
    // Continue to the questions after Section 5 (Section 6+)
    // currentIndex is already at section5StartIndex, so just move forward
    setCurrentScreen(template.slug, 'questions')
  }, [template.slug])

  const handleValueForestBack = useCallback(() => {
    // Exit Value Forest and go back to the last Section 4 question
    setScreenState({ screen: 'questions' })
    const newIndex = section5StartIndex - 1
    setCurrentIndex(newIndex)
    setQuestionIndex(template.slug, newIndex)
    setCurrentScreen(template.slug, 'questions')
  }, [template.slug, section5StartIndex])

  const handleVisualizationComplete = useCallback(() => {
    setScreenState({ screen: 'questions' })
    setCurrentScreen(template.slug, 'questions')
  }, [template.slug])

  const handleResponseChange = useCallback(
    (value: string) => {
      const questionId = displayQuestions[currentIndex].id
      const newResponses = { ...responses, [questionId]: value }
      setResponses(newResponses)

      if (user?.id) {
        // Save to database for authenticated users
        saveAuthenticatedReview(
          user.id,
          template.slug,
          template.year,
          newResponses,
          currentIndex
        )
      } else {
        // Save to localStorage for guests
        saveGuestResponse(template.slug, questionId, value)
      }
    },
    [template.slug, displayQuestions, currentIndex, responses, user]
  )

  const handleNext = useCallback(() => {
    const isHenryTemplate = template.slug === 'henry-finkelstein'

    if (currentIndex < displayQuestions.length - 1) {
      const newIndex = currentIndex + 1
      const effectiveIndex = getEffectiveIndex(newIndex, section5StartIndex, isHenryTemplate)

      // Check if we're entering Section 5 (Value Forest) for Henry's template
      if (isHenryTemplate && newIndex === section5StartIndex) {
        setScreenState({ screen: 'value-forest' })
        setCurrentScreen(template.slug, 'value-forest')
        setCurrentIndex(newIndex)
        setQuestionIndex(template.slug, newIndex)
        // Track progress for authenticated users (both modes)
        // Note: Value Forest will track its own internal progress
        if (user?.id) {
          updateAuthenticatedProgress(user.id, template.slug, template.year, effectiveIndex)
        }
        return
      }

      // Check if we're entering the visualization question for Henry's template
      if (isHenryTemplate && newIndex === visualizationQuestionIndex) {
        setScreenState({ screen: 'visualization' })
        setCurrentScreen(template.slug, 'visualization')
        setCurrentIndex(newIndex)
        setQuestionIndex(template.slug, newIndex)
        // Track progress for authenticated users (both modes)
        if (user?.id) {
          updateAuthenticatedProgress(user.id, template.slug, template.year, effectiveIndex)
        }
        return
      }

      setCurrentIndex(newIndex)
      setQuestionIndex(template.slug, newIndex)
      // Track progress for authenticated users (both modes)
      if (user?.id) {
        updateAuthenticatedProgress(user.id, template.slug, template.year, effectiveIndex)
      }
    } else {
      // Complete the review - track final question index before navigation
      const finalEffectiveIndex = getEffectiveIndex(displayQuestions.length - 1, section5StartIndex, isHenryTemplate)
      if (user?.id) {
        // Save final progress (total questions answered)
        updateAuthenticatedProgress(user.id, template.slug, template.year, finalEffectiveIndex + 1)
        // Flush authenticated storage before navigation
        flushAuthenticatedStorage()
      }
      completeGuestReview(template.slug)
      flushStorage()
      router.push(`/review/${template.slug}/complete`)
    }
  }, [template.slug, displayQuestions, currentIndex, router, section5StartIndex, visualizationQuestionIndex, user])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      // Check if we're at the first question after Section 5 (Value Forest) for Henry's template
      // Going back should enter the Value Forest section
      if (template.slug === 'henry-finkelstein' && currentIndex === section5StartIndex) {
        setScreenState({ screen: 'value-forest' })
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
      // Only handle keyboard events on questions screen (other screens have their own handlers)
      if (screenState.screen !== 'questions') return

      const currentQuestion = displayQuestions[currentIndex]

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
            handleNext()
          }
        } else {
          // For other input types: Enter without Shift
          if (!e.shiftKey) {
            e.preventDefault()
            handleNext()
          }
        }
      }

      // Handle arrow keys and page up/down (navigation)
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        handleNext()
      }

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        handlePrevious()
      }

      // Handle Escape (go back to intro)
      if (e.key === 'Escape') {
        e.preventDefault()
        setScreenState({ screen: 'intro' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screenState.screen, reviewMode, currentIndex, displayQuestions, handleNext, handlePrevious])

  // Don't render anything until client-side (localStorage access requires client)
  if (!isClient) {
    return <LoadingState />
  }

  // Render based on screen state using switch for exhaustive checking
  switch (screenState.screen) {
    case 'intro':
      // Use custom intro for Henry's template
      if (template.slug === 'henry-finkelstein') {
        return (
          <HenryIntro
            template={template}
            onStart={handleStart}
            hasExistingProgress={Object.keys(responses).length > 0}
            isAuthenticated={!!user}
          />
        )
      }
      return (
        <TemplateIntro
          template={template}
          onStart={handleStart}
          hasExistingProgress={Object.keys(responses).length > 0}
          isAuthenticated={!!user}
        />
      )

    case 'housekeeping':
      return <HousekeepingPage onComplete={handleHousekeepingComplete} />

    case 'handwriting':
      return <HandwritingPage onContinue={handleHandwritingModeSelect} />

    case 'centering':
      return <CenteringPage onBegin={handleCenteringComplete} />

    case 'value-forest':
      return (
        <ValueForestSection
          templateSlug={template.slug}
          mode={reviewMode}
          onComplete={handleValueForestComplete}
          onBack={handleValueForestBack}
          user={user}
          baseQuestionIndex={section5StartIndex}
          year={template.year}
        />
      )

    case 'visualization':
      return <VisualizationPage onBegin={handleVisualizationComplete} />

    case 'questions': {
      // Bounds check for safety - shouldn't happen in normal flow but guards against bad state
      const safeIndex = Math.max(0, Math.min(currentIndex, displayQuestions.length - 1))
      const currentQuestion = displayQuestions[safeIndex]
      const currentValue = responses[currentQuestion.id] || ''

      // For Henry's template, adjust question numbers to include Value Forest
      const isHenryTemplate = template.slug === 'henry-finkelstein'
      const isAfterValueForest = isHenryTemplate && safeIndex >= section5StartIndex
      const valueForestOffset = isAfterValueForest ? VALUE_FOREST_QUESTION_COUNT : 0
      const adjustedQuestionNumber = safeIndex + 1 + valueForestOffset
      const adjustedTotal = isHenryTemplate
        ? displayQuestions.length + VALUE_FOREST_QUESTION_COUNT
        : displayQuestions.length

      return (
        <>
          <ReviewProgressBar
            current={adjustedQuestionNumber}
            total={adjustedTotal}
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
            isFirst={safeIndex === 0}
            isLast={safeIndex === displayQuestions.length - 1}
            questionNumber={adjustedQuestionNumber}
            totalQuestions={adjustedTotal}
            mode={reviewMode}
          />
        </>
      )
    }

    default: {
      // TypeScript exhaustiveness check - this should never execute
      const _exhaustiveCheck: never = screenState
      return _exhaustiveCheck
    }
  }
}
