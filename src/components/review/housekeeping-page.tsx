'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HousekeepingItem {
  id: string
  title: string
  description: string
}

const housekeepingItems: HousekeepingItem[] = [
  {
    id: 'brain-dump',
    title: 'Brain dump',
    description:
      "Write down anything free-floating or taking up mental space. Keep writing until you have 60 seconds where nothing new comes to mind.",
  },
  {
    id: 'task-list',
    title: 'Clear your task list',
    description:
      "Process or park any open items in your to-do system so they're not nagging at you.",
  },
  {
    id: 'inbox',
    title: 'Clear your inbox',
    description: 'Triage, archive, or declare email bankruptcy. Zero or close to it.',
  },
  {
    id: 'desktop',
    title: 'Clear your desktop',
    description: 'Digital clutter creates mental clutter.',
  },
  {
    id: 'downloads',
    title: 'Clear your downloads folder',
    description: "Yes, that too. Or archive then clear it, if you're worried about losing something.",
  },
  {
    id: 'physical-space',
    title: 'Clear your physical space',
    description: 'Clean your desk, or better yet, go somewhere entirely new and different.',
  },
  {
    id: 'gather-materials',
    title: 'Gather your materials',
    description: "If you keep a paper journal, physical planner, or printed notes, grab them. They'll be helpful in Section 2.",
  },
]

type ItemState = 'unset' | 'done' | 'skipped'

interface HousekeepingPageProps {
  onComplete: (responses: Record<string, ItemState>) => void
  initialResponses?: Record<string, ItemState>
}

export function HousekeepingPage({ onComplete, initialResponses = {} }: HousekeepingPageProps) {
  const [responses, setResponses] = useState<Record<string, ItemState>>(initialResponses)

  // Check if all items have been interacted with
  const allItemsAddressed = housekeepingItems.every(
    (item) => responses[item.id] === 'done' || responses[item.id] === 'skipped'
  )

  const handleToggle = (id: string, newState: ItemState) => {
    setResponses((prev) => {
      const currentState = prev[id]
      // If clicking the same state, toggle it off (back to unset)
      if (currentState === newState) {
        const { [id]: _, ...rest } = prev
        return { ...rest, [id]: 'unset' }
      }
      return { ...prev, [id]: newState }
    })
  }

  const handleContinue = () => {
    onComplete(responses)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-2xl mx-auto">
      {/* Intro */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Clear the Decks</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Before we dive deep, let's clear the mental and practical clutter. The cleaner your space,
          the stronger your signal will be.
        </p>
        <p className="text-sm text-muted-foreground italic">
          I personally chip away at this in short bursts for a few days before my review. Don't try to do this all in one sitting if it feels overwhelming.
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-3 mb-10">
        {housekeepingItems.map((item) => {
          const state = responses[item.id] || 'unset'

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-4 p-4 rounded-lg border transition-all',
                state === 'done' && 'bg-green-500/10 border-green-500/30',
                state === 'skipped' && 'bg-muted/50 border-muted-foreground/20',
                state === 'unset' && 'bg-background border-border hover:border-muted-foreground/50'
              )}
            >
              {/* Item text */}
              <div className={cn('flex-1', state === 'skipped' && 'opacity-60')}>
                <p
                  className={cn(
                    'font-medium text-lg',
                    state === 'skipped' && 'line-through'
                  )}
                >
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>

              {/* Toggle buttons */}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handleToggle(item.id, 'done')}
                  className={cn(
                    'p-2 rounded-full transition-all',
                    state === 'done'
                      ? 'bg-green-500 text-white'
                      : 'bg-muted hover:bg-green-500/20 text-muted-foreground hover:text-green-500'
                  )}
                  aria-label="Mark as done"
                  title="Done"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleToggle(item.id, 'skipped')}
                  className={cn(
                    'p-2 rounded-full transition-all',
                    state === 'skipped'
                      ? 'bg-slate-500 text-white'
                      : 'bg-muted hover:bg-slate-400/30 text-muted-foreground hover:text-slate-500'
                  )}
                  aria-label="Skip this item"
                  title="Skip"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Continue button */}
      <div className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!allItemsAddressed}
          className="text-lg px-8"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {!allItemsAddressed && (
          <p className="text-sm text-muted-foreground">
            Acknowledge each item before continuing (done or skipped)
          </p>
        )}
      </div>
    </div>
  )
}
