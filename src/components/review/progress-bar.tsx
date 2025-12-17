'use client'

import { Progress } from '@/components/ui/progress'

interface ReviewProgressBarProps {
  current: number
  total: number
  templateName?: string
  sectionName?: string
  sectionCurrent?: number
  sectionTotal?: number
}

export function ReviewProgressBar({
  current,
  total,
  sectionName,
  sectionCurrent,
  sectionTotal,
}: ReviewProgressBarProps) {
  // Calculate section progress if provided, otherwise fall back to overall
  const hasSectionInfo = sectionName && sectionCurrent !== undefined && sectionTotal !== undefined
  const percentage = hasSectionInfo
    ? Math.round((sectionCurrent / sectionTotal) * 100)
    : Math.round((current / total) * 100)

  // Display section name as-is (already formatted as "1) Opening", "2) Remember", etc.)
  const displaySectionName = sectionName || ''

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-3xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          {hasSectionInfo ? (
            <span className="text-sm font-medium truncate mr-4">
              {displaySectionName}
            </span>
          ) : (
            <span className="text-sm font-medium truncate mr-4">
              Getting started
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {percentage}%
          </span>
        </div>
        <Progress value={percentage} className="h-1" />
      </div>
    </div>
  )
}
