'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronUp, ChevronDown, ArrowLeft, Sparkles } from 'lucide-react'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { OVERVIEW_QUESTIONS, SATISFACTION_LABELS } from '@/lib/value-trees'
import { SatisfactionDots } from '@/components/ui/satisfaction-dots'
import type { ValueTree, ValueTreeResponse } from '@/lib/value-trees'

interface ForestOverviewProps {
  trees: ValueTree[]
  responses: Record<string, ValueTreeResponse>
  ranking: string[]
  overviewResponses: Record<string, string>
  currentQuestionIndex: number
  mode: 'digital' | 'handwriting'
  onAnswer: (questionId: string, value: string) => void
  onNext: () => void
  onPrevious: () => void
  onComplete: () => void
  onBack: () => void
}

export function ForestOverview({
  trees,
  responses,
  ranking,
  overviewResponses,
  currentQuestionIndex,
  mode,
  onAnswer,
  onNext,
  onPrevious,
  onComplete,
  onBack,
}: ForestOverviewProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isHandwriting = mode === 'handwriting'
  const [showTable, setShowTable] = useState(currentQuestionIndex === -1)

  // Get tree by ID
  const getTree = (id: string) => trees.find((t) => t.id === id)

  // Calculate these before hooks so they're always defined
  const question = OVERVIEW_QUESTIONS[currentQuestionIndex] || OVERVIEW_QUESTIONS[0]
  const value = overviewResponses[question?.id] || ''
  const isLastQuestion = currentQuestionIndex === OVERVIEW_QUESTIONS.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  // Focus input on mount (only in digital mode)
  useEffect(() => {
    if (!showTable && !isHandwriting && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentQuestionIndex, isHandwriting, showTable])

  // Custom navigation handlers that account for table state and first/last question
  const handleNavNext = useCallback(() => {
    if (showTable) {
      setShowTable(false)
    } else if (isLastQuestion) {
      onComplete()
    } else {
      onNext()
    }
  }, [showTable, isLastQuestion, onComplete, onNext])

  const handleNavPrevious = useCallback(() => {
    if (isFirstQuestion) {
      setShowTable(true)
    } else {
      onPrevious()
    }
  }, [isFirstQuestion, onPrevious])

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: handleNavNext,
    onPrevious: handleNavPrevious,
    enterToAdvance: showTable || isHandwriting, // Enter advances in table view or handwriting mode
    enabled: true,
  })

  // If we're showing the table (before questions)
  if (showTable) {
    return (
      <div className="min-h-screen flex flex-col px-6 pt-20 pb-12 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Value Forest</h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your Value Trees, ranked by priority with your satisfaction scores.
          </p>
        </div>

        {/* Summary Table */}
        <div className="flex-1 mb-8">
          <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 bg-muted/50 text-sm font-medium border-b">
              <div className="w-12">Rank</div>
              <div>Tree</div>
              <div className="w-40">Satisfaction</div>
            </div>

            {/* Rows */}
            {ranking.map((treeId, index) => {
              const tree = getTree(treeId)
              if (!tree) return null
              const response = responses[treeId]

              return (
                <div
                  key={treeId}
                  className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 border-b last:border-b-0 items-center"
                >
                  <div className="w-12 font-medium">{index + 1}</div>
                  <div className="flex items-center gap-2">
                    {tree.name}
                    {tree.isCustom && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="w-40">
                    <SatisfactionDots score={response?.satisfaction} labels={SATISFACTION_LABELS as Record<number, string>} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Ranking
          </Button>
          <Button onClick={() => setShowTable(false)}>Continue to Reflections</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-3xl mx-auto">
      {/* Question number */}
      <div className="mb-2">
        <span className="text-sm text-muted-foreground">
          Reflection {currentQuestionIndex + 1} of {OVERVIEW_QUESTIONS.length}
        </span>
      </div>

      {/* Question text */}
      <div
        className={cn(
          'font-semibold mb-4 leading-tight space-y-3',
          isHandwriting ? 'text-3xl md:text-4xl font-serif' : 'text-2xl md:text-3xl'
        )}
      >
        {question.text.split('\n\n').map((paragraph, index, arr) => {
          const isLast = index === arr.length - 1
          return (
            <p key={index} className={index > 0 ? 'text-xl md:text-2xl font-normal text-muted-foreground' : ''}>
              {paragraph}
              {isLast && question.henryNote && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex ml-1.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors align-baseline"
                        aria-label="Tip from Henry"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs p-3">
                      <p className="text-sm leading-relaxed">{question.henryNote}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </p>
          )
        })}
      </div>

      {/* Input - hidden in handwriting mode */}
      {!isHandwriting && (
        <div className="mb-8">
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            placeholder="Your thoughts..."
            className="min-h-[200px] text-lg resize-none border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0"
          />
        </div>
      )}

      {/* Spacer for handwriting mode */}
      {isHandwriting && <div className="mb-8" />}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isHandwriting ? (
            <span>
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> when ready
            </span>
          ) : (
            <span>
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd> +{' '}
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to continue
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isFirstQuestion) {
                setShowTable(true)
              } else {
                onPrevious()
              }
            }}
            className="text-muted-foreground"
          >
            {isFirstQuestion ? 'Back to Table' : 'Skip'}
          </Button>

          <div className="h-4 w-px bg-border mx-2" />

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (isFirstQuestion) {
                setShowTable(true)
              } else {
                onPrevious()
              }
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (isLastQuestion) {
                onComplete()
              } else {
                onNext()
              }
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              if (isLastQuestion) {
                onComplete()
              } else {
                onNext()
              }
            }}
            className="ml-2"
          >
            {isLastQuestion ? 'Finish Value Forest' : isHandwriting ? 'Next' : 'OK'}
          </Button>
        </div>
      </div>
    </div>
  )
}
