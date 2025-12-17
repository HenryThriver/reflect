'use client'

import { cn } from '@/lib/utils'

// Default labels for satisfaction scores (can be overridden via props)
const DEFAULT_LABELS: Record<number, string> = {
  1: 'Extremely frustrated',
  2: 'Frustrated',
  3: 'Neutral',
  4: 'Pleased',
  5: 'Extremely pleased',
}

interface SatisfactionDotsProps {
  /** Satisfaction score (1-5) */
  score?: number
  /** Whether to show the label text next to dots */
  showLabel?: boolean
  /** Custom labels for each score level. Falls back to defaults. */
  labels?: Record<number, string>
  /** Number of dots to display (default: 5) */
  maxScore?: number
}

export function SatisfactionDots({
  score,
  showLabel = true,
  labels = DEFAULT_LABELS,
  maxScore = 5,
}: SatisfactionDotsProps) {
  if (!score) return null
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxScore }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          className={cn('w-2 h-2 rounded-full', n <= score ? 'bg-primary' : 'bg-muted')}
        />
      ))}
      {showLabel && labels[score] && (
        <span className="text-xs text-muted-foreground ml-2">{labels[score]}</span>
      )}
    </div>
  )
}
