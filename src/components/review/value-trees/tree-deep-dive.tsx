'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronUp, SkipForward, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TREE_QUESTIONS, SATISFACTION_LABELS } from '@/lib/value-trees'
import type { ValueTree, SatisfactionScore } from '@/lib/value-trees'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'

interface TreeDeepDiveProps {
  tree: ValueTree
  treeIndex: number
  totalTrees: number
  questionIndex: number
  existingValue?: string
  mode: 'digital' | 'handwriting'
  onAnswer: (value: string) => void
  onNext: () => void
  onPrevious: () => void
  onSkipQuestion: () => void
  onSkipTree: () => void
}

export function TreeDeepDive({
  tree,
  treeIndex,
  totalTrees,
  questionIndex,
  existingValue,
  mode,
  onAnswer,
  onNext,
  onPrevious,
  onSkipQuestion,
  onSkipTree,
}: TreeDeepDiveProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isHandwriting = mode === 'handwriting'
  const question = TREE_QUESTIONS[questionIndex]
  const isScaleQuestion = question.type === 'scale'
  const isFirstQuestion = questionIndex === 0 && treeIndex === 0
  const isLastQuestion = questionIndex === TREE_QUESTIONS.length - 1 && treeIndex === totalTrees - 1

  // Get prefilled value for scope question
  const value = existingValue ?? (question.prefill && tree.description ? tree.description : '')

  // Replace [TREE] placeholder with styled tree name
  // We'll use a placeholder that the render can identify and style
  const TREE_PLACEHOLDER = '___TREE_NAME___'
  const questionTextWithPlaceholder = question.text.replace(/\[TREE\]/g, TREE_PLACEHOLDER)

  // Split by double newlines for paragraph breaks
  const questionParagraphs = questionTextWithPlaceholder.split('\n\n')

  useEffect(() => {
    // Focus input on mount (only in digital mode and for textarea)
    if (!isHandwriting && !isScaleQuestion) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [questionIndex, treeIndex, isHandwriting, isScaleQuestion])

  // Number key handler for scale questions
  const handleNumberKey = useCallback((num: number) => {
    onAnswer(String(num))
  }, [onAnswer])

  // Keyboard navigation
  useKeyboardNavigation({
    onNext,
    onPrevious,
    enterToAdvance: isHandwriting || isScaleQuestion, // Enter advances in handwriting mode or scale questions
    enableNumberKeys: isScaleQuestion && !isHandwriting,
    onNumberKey: handleNumberKey,
  })

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-3xl mx-auto">
      {/* Tree indicator */}
      <div className="mb-2">
        <span className="text-sm text-muted-foreground">
          Tree {treeIndex + 1} of {totalTrees}: <span className="font-medium">{tree.name}</span>
        </span>
      </div>

      {/* Question number within tree */}
      <div className="mb-2">
        <span className="text-sm text-muted-foreground">
          Question {questionIndex + 1} of {TREE_QUESTIONS.length}
        </span>
      </div>

      {/* Question text */}
      <div
        className={cn(
          'font-semibold mb-4 leading-tight space-y-3',
          isHandwriting ? 'text-3xl md:text-4xl font-serif' : 'text-2xl md:text-3xl'
        )}
      >
        {questionParagraphs.map((paragraph, index) => (
          <p key={index} className={index > 0 ? 'text-xl md:text-2xl font-normal text-muted-foreground' : ''}>
            {paragraph.split(TREE_PLACEHOLDER).map((part, partIndex, arr) => (
              <span key={partIndex}>
                {part}
                {partIndex < arr.length - 1 && (
                  <span className="text-emerald-700 dark:text-emerald-500">{tree.name}</span>
                )}
              </span>
            ))}
          </p>
        ))}
      </div>

      {/* Help text */}
      {question.helpText && (
        <p className="text-muted-foreground mb-6">{question.helpText}</p>
      )}

      {/* Scale question - shown in both modes */}
      {isScaleQuestion && (
        <div className="mb-8">
          <div className="flex justify-center gap-2 md:gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => onAnswer(String(num))}
                disabled={isHandwriting}
                className={cn(
                  'flex flex-col items-center gap-2 p-2 md:p-3 rounded-lg transition-colors min-w-[60px] md:min-w-[80px]',
                  isHandwriting
                    ? 'cursor-default'
                    : value === String(num)
                      ? 'bg-primary/10'
                      : 'hover:bg-accent'
                )}
              >
                <Star
                  className={cn(
                    'h-6 w-6 md:h-8 md:w-8 transition-colors',
                    isHandwriting
                      ? 'text-muted-foreground/30 fill-muted-foreground/10'
                      : value === String(num)
                        ? 'text-amber-500 fill-amber-500'
                        : parseInt(value) >= num
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground/40'
                  )}
                />
                <span
                  className={cn(
                    'text-xs text-center leading-tight',
                    isHandwriting
                      ? 'text-muted-foreground/50'
                      : value === String(num)
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                  )}
                >
                  {SATISFACTION_LABELS[num as SatisfactionScore]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text input - hidden in handwriting mode */}
      {!isHandwriting && !isScaleQuestion && (
        <div className="mb-8">
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Your thoughts..."
            className="min-h-[200px] text-lg resize-none border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0"
          />
        </div>
      )}

      {/* Spacer for handwriting mode (non-scale questions only) */}
      {isHandwriting && !isScaleQuestion && <div className="mb-8" />}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {isHandwriting ? (
              <span>
                Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> when ready
              </span>
            ) : isScaleQuestion ? (
              <span>
                Press <kbd className="px-2 py-1 bg-muted rounded text-xs">1-5</kbd> or{' '}
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
              </span>
            ) : (
              <span>
                Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd> +{' '}
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to continue
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Skip buttons */}
          <Button variant="ghost" size="sm" onClick={onSkipQuestion} className="text-muted-foreground">
            Skip
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipTree}
            className="text-muted-foreground gap-1"
          >
            <SkipForward className="h-3 w-3" />
            Skip Tree
          </Button>

          <div className="h-4 w-px bg-border mx-2" />

          <Button variant="outline" size="icon" onClick={onPrevious} disabled={isFirstQuestion}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button onClick={onNext} className="ml-2">
            {isLastQuestion ? 'Finish Trees' : isHandwriting ? 'Next' : 'OK'}
          </Button>
        </div>
      </div>
    </div>
  )
}
