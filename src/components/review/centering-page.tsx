'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface CenteringPageProps {
  onBegin: () => void
}

export function CenteringPage({ onBegin }: CenteringPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Image - centered with breathing room */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12">
        <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/images/tea-ceremony.jpg"
            alt="Two bowls of tea on a wooden board with wildflowers"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Text and button */}
      <div className="px-6 pb-12 md:pb-16 text-center max-w-2xl mx-auto">
        <p className="text-lg md:text-xl text-muted-foreground mb-4 font-light">
          Grab your favorite warm beverage in your favorite mug or bowl.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground mb-4 font-light">
          Put on your favorite deep focus music.
        </p>
        <div className="mb-4">
          <p className="text-lg md:text-xl text-muted-foreground font-semibold">
            Take 3 breaths.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            Inhale through your nose for 4, exhale through your mouth for 8.
          </p>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 font-light">
          When you&apos;re ready, begin.
        </p>
        <Button
          size="lg"
          onClick={onBegin}
          className="text-lg px-10"
        >
          Begin
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
