'use client'

import { useEffect, useRef, useState } from 'react'
import { Question } from '@/lib/templates/types'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// Parse inline markdown (links, bold) within a single paragraph
function parseInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|([^[*]+)/g
  let match
  let keyIndex = 0

  while ((match = regex.exec(text)) !== null) {
    const [, linkText, linkUrl, boldText, plainText] = match

    if (linkText && linkUrl) {
      parts.push(
        <a
          key={`${keyPrefix}-${keyIndex++}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {linkText}
        </a>
      )
    } else if (boldText) {
      parts.push(<strong key={`${keyPrefix}-${keyIndex++}`}>{boldText}</strong>)
    } else if (plainText) {
      parts.push(plainText)
    }
  }

  return parts
}

// Parse question text into styled paragraphs (first paragraph bold, rest muted)
// henryNoteElement is appended inline at the end of the last paragraph (footnote style)
function parseQuestionParagraphs(
  text: string,
  subhead?: string,
  henryNoteElement?: React.ReactNode
): React.ReactNode {
  const paragraphs = text.split(/\n\n/)
  // Combine text paragraphs with optional subhead
  const allParagraphs = subhead ? [...paragraphs, subhead] : paragraphs
  const lastIndex = allParagraphs.length - 1

  return (
    <div className="space-y-3">
      {allParagraphs.map((paragraph, index) => (
        <p
          key={index}
          className={index > 0 ? 'text-xl md:text-2xl font-normal text-muted-foreground' : ''}
        >
          {parseInlineMarkdown(paragraph, `p${index}`)}
          {index === lastIndex && henryNoteElement}
        </p>
      ))}
    </div>
  )
}

interface TypeformQuestionProps {
  question: Question
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
  questionNumber: number
  totalQuestions: number
  mode?: 'digital' | 'handwriting'
}

export function TypeformQuestion({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  questionNumber,
  totalQuestions,
  mode = 'digital',
}: TypeformQuestionProps) {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const isHandwriting = mode === 'handwriting'

  useEffect(() => {
    // Focus input on mount (only in digital mode)
    if (!isHandwriting) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [question.id, isHandwriting])

  // Users can always proceed - no required field validation
  const canProceed = true

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-3xl mx-auto">
      {/* Section indicator - hidden for now */}
      {/* {question.section && (
        <div className="mb-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {question.section}
          </span>
        </div>
      )} */}

      {/* Question number */}
      <div className="mb-2">
        <span className="text-sm text-muted-foreground">
          {questionNumber} → {totalQuestions}
        </span>
      </div>

      {/* Question text (with optional subhead and footnote-style henryNote) */}
      <div
        className={cn(
          'font-semibold mb-4 leading-tight font-serif',
          isHandwriting
            ? 'text-3xl md:text-4xl'
            : 'text-2xl md:text-3xl'
        )}
      >
        {parseQuestionParagraphs(
          question.text,
          question.subhead,
          question.henryNote ? (
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
          ) : undefined
        )}
      </div>

      {/* Help text */}
      {question.helpText && (
        <p className="text-muted-foreground mb-6">{question.helpText}</p>
      )}

      {/*
        Henry's personal note - OPTIONS TO TRY:

        OPTION A: Tooltip (hover to reveal)
        OPTION B: Footer note (below input, subtle postscript)
        OPTION C: Collapsed/expandable

        Currently using: OPTION B (Footer note)
      */}

      {/* Input based on question type - hidden in handwriting mode */}
      {!isHandwriting && (
      <div className="mb-8">
        {question.type === 'textarea' && (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="min-h-[200px] text-lg font-[family-name:var(--font-lora)] resize-none border border-border/50 rounded-lg p-4 bg-muted/30 placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
          />
        )}

        {question.type === 'text' && (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="text-lg font-[family-name:var(--font-lora)] border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 h-auto py-2"
          />
        )}

        {question.type === 'select' && question.options && (
          <RadioGroup
            value={value}
            onValueChange={onChange}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div
                key={option}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                  value === option
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => onChange(option)}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="cursor-pointer flex-1"
                >
                  <span className="mr-2 text-muted-foreground">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'scale' && (
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from(
              { length: (question.maxValue || 10) - (question.minValue || 1) + 1 },
              (_, i) => (question.minValue || 1) + i
            ).map((num) => (
              <button
                key={num}
                onClick={() => onChange(String(num))}
                className={cn(
                  'w-12 h-12 rounded-lg border-2 text-lg font-medium transition-colors',
                  value === String(num)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Spacer for handwriting mode */}
      {isHandwriting && <div className="mb-8" />}


      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isHandwriting ? (
            <span>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> when ready</span>
          ) : question.type === 'textarea' ? (
            <span>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to continue</span>
          ) : (
            <span>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to continue</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            disabled={isFirst}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={!canProceed}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="ml-2"
          >
            {isLast ? 'Finish' : isHandwriting ? 'Next Question' : 'OK'}
          </Button>
        </div>
      </div>
    </div>
  )
}
