'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowRight } from 'lucide-react'

interface VisualizationPageProps {
  onBegin: () => void
}

// Grouped stanzas - each group appears line by line, then fades out together
const STANZAS = [
  [
    'Picture yourself in your happy place.',
    'Somewhere you feel completely at peace.',
    'Maybe this is a petrichor-rich forest with dappled early afternoon light.',
    'Or a white sand beach on a placid warm lakeside.',
  ],
  [
    'As you take in the beauty of your surroundings, you start slowly walking.',
    'You keep moving through the terrain, totally absorbed.',
    'Until you notice a second pair of footprints.',
  ],
  [
    'You follow the footprints until you notice a warm and inviting roaring firepit with two seats.',
    'You nestle into the first empty chair and are amazed by its comfort.',
    'You hear someone else approaching.',
  ],
  [
    'In the chair immediately next to you sits down ...',
    '... you 30 years from now.',
  ],
  [
    'Future you is wise. At peace.',
    'An air of authority with something important to share with you.',
  ],
  [
    'Future you leans in and clears their throat.',
    'You close your eyes and take a deep breath to center yourself.',
  ],
  [
    "Your eyes flutter open and you're perfectly present.",
    'You lean in.',
    'Future you starts speaking.',
  ],
]

export function VisualizationPage({ onBegin }: VisualizationPageProps) {
  const [showIntermission, setShowIntermission] = useState(true)
  const [currentStanza, setCurrentStanza] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
  const [lineOpacities, setLineOpacities] = useState<number[]>([])
  const [stanzaOpacity, setStanzaOpacity] = useState(1)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Don't run stanza animation if still showing intermission
    if (showIntermission) return

    if (currentStanza >= STANZAS.length) {
      setIsComplete(true)
      return
    }

    const stanza = STANZAS[currentStanza]

    // If we haven't shown all lines in this stanza yet, show the next one
    if (visibleLines < stanza.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
        // Add new line at opacity 0, then fade it in
        setLineOpacities((prev) => [...prev, 0])
        // Trigger fade in after a brief moment
        setTimeout(() => {
          setLineOpacities((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = 1
            return updated
          })
        }, 50)
      }, visibleLines === 0 ? 100 : 2000) // First line appears quickly, rest have delay
      return () => clearTimeout(timer)
    }

    // All lines shown - hold for a moment, then fade out and advance
    // For the last stanza, don't fade out - just show the Continue button
    if (currentStanza === STANZAS.length - 1) {
      const completeTimer = setTimeout(() => {
        setIsComplete(true)
      }, 3000) // Hold for 3s then show Continue button
      return () => clearTimeout(completeTimer)
    }

    const holdTimer = setTimeout(() => {
      setStanzaOpacity(0)
    }, 3000) // Hold complete stanza for 3s (extra breath to read)

    const advanceTimer = setTimeout(() => {
      setCurrentStanza((prev) => prev + 1)
      setVisibleLines(0)
      setLineOpacities([])
      setStanzaOpacity(1)
    }, 3800) // Wait for fade out (800ms) + hold (3000ms)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(advanceTimer)
    }
  }, [showIntermission, currentStanza, visibleLines])

  // Allow skipping ahead
  const handleSkip = () => {
    setCurrentStanza(STANZAS.length)
    setIsComplete(true)
  }

  const isLastStanza = currentStanza === STANZAS.length - 1

  // Intermission screen
  if (showIntermission) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-rose-50 to-amber-50 dark:from-violet-950 dark:via-slate-900 dark:to-amber-950 -z-10" />

        {/* Animated subtle orbs for depth */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/30 dark:bg-violet-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-200/30 dark:bg-rose-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-200/30 dark:bg-amber-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        </div>

        {/* Intermission Content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-2xl mx-auto w-full text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-8 text-foreground/90">
            Official Intermission
          </h1>

          <div className="space-y-6 text-lg md:text-xl text-muted-foreground mb-12">
            <p>
              If you haven&apos;t stretched or refilled your warm beverage recently, do so now.
            </p>
            <p>
              Come on back when you&apos;re ready and click start below for a short guided meditation.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setShowIntermission(false)}
            className="text-lg px-10 mx-auto"
          >
            Start
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-rose-50 to-amber-50 dark:from-violet-950 dark:via-slate-900 dark:to-amber-950 -z-10" />

      {/* Animated subtle orbs for depth */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/30 dark:bg-violet-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-200/30 dark:bg-rose-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-200/30 dark:bg-amber-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-serif mb-16 text-foreground/90 text-center">
          Meeting Your Future Self
        </h1>

        <div className="flex-1 flex items-center justify-center min-h-[250px]">
          <div
            className="space-y-4 text-center max-w-3xl transition-opacity duration-700 ease-in-out"
            style={{ opacity: stanzaOpacity }}
          >
            {STANZAS[currentStanza]?.slice(0, visibleLines).map((line, index) => (
              <p
                key={index}
                className={`text-xl md:text-2xl leading-relaxed transition-opacity duration-700 ease-in-out ${
                  isLastStanza ? 'font-medium text-foreground/80' : 'text-muted-foreground'
                }`}
                style={{ opacity: lineOpacities[index] ?? 0 }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-12">
          {isComplete && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-opacity duration-1000 ease-in-out"
                >
                  Reread full visualization
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif">Meeting Your Future Self</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4 text-left">
                  {STANZAS.map((stanza, stanzaIndex) => (
                    <div key={stanzaIndex} className="space-y-2">
                      {stanza.map((line, lineIndex) => (
                        <p
                          key={lineIndex}
                          className="text-base leading-relaxed text-muted-foreground"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
          <div className="flex justify-center gap-4">
            {!isComplete && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip
              </Button>
            )}
            <Button
              size="lg"
              onClick={onBegin}
              disabled={!isComplete}
              className={`text-lg px-10 transition-opacity duration-1000 ease-in-out ${isComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
