'use client'

import { useState, useEffect, useRef } from 'react'
import { Question } from '@/lib/templates/types'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}: TypeformQuestionProps) {
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
    return () => clearTimeout(timer)
  }, [question.id])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && question.type !== 'textarea') {
      e.preventDefault()
      onNext()
    }
    if (e.key === 'Enter' && e.metaKey && question.type === 'textarea') {
      e.preventDefault()
      onNext()
    }
  }

  const canProceed = !question.required || localValue.trim().length > 0

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-3xl mx-auto">
      {/* Section indicator */}
      {question.section && (
        <div className="mb-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {question.section}
          </span>
        </div>
      )}

      {/* Question number */}
      <div className="mb-2">
        <span className="text-sm text-muted-foreground">
          {questionNumber} → {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </h1>

      {/* Help text */}
      {question.helpText && (
        <p className="text-muted-foreground mb-6">{question.helpText}</p>
      )}

      {/* Input based on question type */}
      <div className="mb-8">
        {question.type === 'textarea' && (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={question.placeholder}
            className="min-h-[200px] text-lg resize-none border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0"
          />
        )}

        {question.type === 'text' && (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={question.placeholder}
            className="text-lg border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 h-auto py-2"
          />
        )}

        {question.type === 'select' && question.options && (
          <RadioGroup
            value={localValue}
            onValueChange={handleChange}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div
                key={option}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                  localValue === option
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => handleChange(option)}
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
                onClick={() => handleChange(String(num))}
                className={cn(
                  'w-12 h-12 rounded-lg border-2 text-lg font-medium transition-colors',
                  localValue === String(num)
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

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {question.type === 'textarea' ? (
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
            {isLast ? 'Finish' : 'OK'}
          </Button>
        </div>
      </div>
    </div>
  )
}
