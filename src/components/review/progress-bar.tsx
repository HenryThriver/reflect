'use client'

import { Progress } from '@/components/ui/progress'
import { calculateProgress } from '@/lib/utils'

interface ReviewProgressBarProps {
  current: number
  total: number
  templateName?: string
}

export function ReviewProgressBar({
  current,
  total,
  templateName,
}: ReviewProgressBarProps) {
  const percentage = calculateProgress(current, total)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-3xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          {templateName && (
            <span className="text-sm font-medium truncate mr-4">
              {templateName}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {percentage}% complete
          </span>
        </div>
        <Progress value={percentage} className="h-1" />
      </div>
    </div>
  )
}
