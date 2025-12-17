'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'

interface ForestIntroProps {
  onContinue: () => void
  onBack: () => void
}

export function ForestIntro({ onContinue, onBack }: ForestIntroProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onContinue()
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        onBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onContinue, onBack])

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-2xl mx-auto">
      {/* Section header */}
      <div className="mb-2">
        <span className="text-sm text-muted-foreground uppercase tracking-wide">
          Section 4
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        Welcome to Your Value Forest
      </h1>

      {/* Introduction */}
      <div className="space-y-6 text-lg text-muted-foreground mb-10">
        <p>
          Traditional goal-setting treats life like a checklist - binary wins and failures that
          often leave us feeling inadequate. The <strong className="text-foreground">Value Forest</strong> is
          different. It&apos;s a living system where your life areas grow as interconnected trees,
          each one rooted in what truly matters to you.
        </p>

        <p>
          Think of your life as a forest. Each <strong className="text-foreground">Value Tree</strong> represents
          an area of responsibility - your health, relationships, career, creativity, finances,
          and more. Like real trees, they have structure:
        </p>

        <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-base">
          <div className="flex gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <strong className="text-foreground">Deep Roots</strong> - Your meaning and purpose,
              the invisible foundation feeding everything above
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🪵</span>
            <div>
              <strong className="text-foreground">Wide Trunk</strong> - Your values and qualities,
              the visible structure that defines how you show up
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <strong className="text-foreground">Diverse Branches</strong> - Your outcomes and
              aspirations, reaching toward what you want to do and who you want to be
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🍃</span>
            <div>
              <strong className="text-foreground">Vibrant Leaves</strong> - Your projects and actions,
              seasonal and changeable without harming the tree
            </div>
          </div>
        </div>

        <p>
          In this section, you&apos;ll select the Value Trees that are most relevant to your life
          right now, then reflect deeply on each one. The goal isn&apos;t perfection in every area -
          it&apos;s awareness of where you are, gratitude for what&apos;s working, and clarity on
          where you want to grow.
        </p>

        <p className="text-base italic">
          Like an aspen grove, your trees share a root system. What nourishes one often feeds
          another. What drains one can affect the whole forest.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button onClick={onContinue} size="lg">
          Enter the Forest
        </Button>
      </div>
    </div>
  )
}
