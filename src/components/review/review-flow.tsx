'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ReviewTemplate } from '@/lib/templates/types'
import {
  getGuestReview,
  startGuestReview,
  saveGuestResponse,
  setQuestionIndex,
  completeGuestReview,
  flushStorage,
} from '@/lib/guest-storage'
import { TemplateIntro } from '@/components/templates/template-intro'
import { TypeformQuestion } from '@/components/review/typeform-question'
import { ReviewProgressBar } from '@/components/review/progress-bar'
import { LoadingState } from '@/components/ui/loading-state'

interface ReviewFlowProps {
  template: ReviewTemplate
}

export function ReviewFlow({ template }: ReviewFlowProps) {
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isClient, setIsClient] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    setIsClient(true)
    const existingReview = getGuestReview(template.slug)
    if (existingReview) {
      setResponses(existingReview.responses)
      setCurrentIndex(existingReview.currentQuestionIndex)
      // If they've already started, skip intro
      if (Object.keys(existingReview.responses).length > 0) {
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
  }, [template.slug])

  const handleResponseChange = useCallback(
    (value: string) => {
      const questionId = template.questions[currentIndex].id
      setResponses((prev) => ({ ...prev, [questionId]: value }))
      saveGuestResponse(template.slug, questionId, value)
    },
    [template, currentIndex]
  )

  const handleNext = useCallback(() => {
    if (currentIndex < template.questions.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setQuestionIndex(template.slug, newIndex)
    } else {
      // Complete the review and flush storage before navigation
      completeGuestReview(template.slug)
      flushStorage()
      router.push(`/review/${template.slug}/complete`)
    }
  }, [template, currentIndex, router])

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
      // Don't handle keyboard events on the intro screen
      if (showIntro) return

      const currentQuestion = template.questions[currentIndex]
      const currentValue = responses[currentQuestion.id] || ''
      const canProceed = !currentQuestion.required || currentValue.trim().length > 0

      // Handle Enter key (proceed to next question)
      if (e.key === 'Enter') {
        // For textarea: only proceed with Cmd/Ctrl + Enter
        if (currentQuestion.type === 'textarea') {
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
  }, [showIntro, currentIndex, template, responses, handleNext, handlePrevious])

  // Don't render anything until client-side (localStorage access requires client)
  if (!isClient) {
    return <LoadingState />
  }

  if (showIntro) {
    return (
      <TemplateIntro
        template={template}
        onStart={handleStart}
        hasExistingProgress={Object.keys(responses).length > 0}
      />
    )
  }

  const currentQuestion = template.questions[currentIndex]
  const currentValue = responses[currentQuestion.id] || ''

  return (
    <>
      <ReviewProgressBar
        current={currentIndex + 1}
        total={template.questions.length}
        templateName={template.name}
      />
      <TypeformQuestion
        question={currentQuestion}
        value={currentValue}
        onChange={handleResponseChange}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentIndex === 0}
        isLast={currentIndex === template.questions.length - 1}
        questionNumber={currentIndex + 1}
        totalQuestions={template.questions.length}
      />
    </>
  )
}
