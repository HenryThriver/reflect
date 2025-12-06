'use client'

import { ReviewTemplate } from '@/lib/templates/types'
import { Button } from '@/components/ui/button'
import { Clock, ListChecks, ArrowRight } from 'lucide-react'

interface TemplateIntroProps {
  template: ReviewTemplate
  onStart: () => void
  hasExistingProgress?: boolean
}

export function TemplateIntro({
  template,
  onStart,
  hasExistingProgress,
}: TemplateIntroProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-2xl mx-auto text-center">
      {/* Creator info */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
          A review by
        </p>
        <h2 className="text-lg font-medium">{template.creator.name}</h2>
        {template.creator.title && (
          <p className="text-muted-foreground">{template.creator.title}</p>
        )}
      </div>

      {/* Template name */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        {template.intro.headline}
      </h1>

      {/* Description */}
      <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
        {template.intro.description}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-center gap-8 mb-8 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>~{template.intro.estimatedMinutes} minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          <span>{template.questions.length} questions</span>
        </div>
      </div>

      {/* Start button */}
      <div className="space-y-3">
        <Button size="lg" onClick={onStart} className="text-lg px-8">
          {hasExistingProgress ? 'Continue Review' : 'Begin Review'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {hasExistingProgress && (
          <p className="text-sm text-muted-foreground">
            You have progress saved. Pick up where you left off.
          </p>
        )}
      </div>

      {/* Tip */}
      <div className="mt-12 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Find a quiet space and give yourself time to reflect deeply.
          There are no wrong answers.
        </p>
      </div>
    </div>
  )
}
