'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getTemplate } from '@/lib/templates'
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

export default function ReviewPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>
}) {
  const { templateSlug } = use(params)
  const router = useRouter()
  const template = getTemplate(templateSlug)

  const [showIntro, setShowIntro] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isClient, setIsClient] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    setIsClient(true)
    const existingReview = getGuestReview(templateSlug)
    if (existingReview) {
      setResponses(existingReview.responses)
      setCurrentIndex(existingReview.currentQuestionIndex)
      // If they've already started, skip intro
      if (Object.keys(existingReview.responses).length > 0) {
        setShowIntro(false)
      }
    }
  }, [templateSlug])

  const handleStart = useCallback(() => {
    const existing = getGuestReview(templateSlug)
    if (!existing) {
      startGuestReview(templateSlug)
    }
    setShowIntro(false)
  }, [templateSlug])

  const handleResponseChange = useCallback((value: string) => {
    if (!template) return
    const questionId = template.questions[currentIndex].id
    setResponses((prev) => ({ ...prev, [questionId]: value }))
    saveGuestResponse(templateSlug, questionId, value)
  }, [template, currentIndex, templateSlug])

  const handleNext = useCallback(() => {
    if (!template) return
    if (currentIndex < template.questions.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setQuestionIndex(templateSlug, newIndex)
    } else {
      // Complete the review and flush storage before navigation
      completeGuestReview(templateSlug)
      flushStorage()
      router.push(`/review/${templateSlug}/complete`)
    }
  }, [template, currentIndex, templateSlug, router])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setQuestionIndex(templateSlug, newIndex)
    }
  }, [currentIndex, templateSlug])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showIntro) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        handleNext()
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        handlePrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showIntro, handleNext, handlePrevious])

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Template not found</p>
      </div>
    )
  }

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
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
