'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, PenLine, Monitor } from 'lucide-react'

interface HandwritingPageProps {
  onContinue: (mode: 'handwriting' | 'digital') => void
}

export function HandwritingPage({ onContinue }: HandwritingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero image - landscape */}
      <div className="relative h-[35vh] md:h-[40vh] w-full">
        <Image
          src="/images/handwritten-review.jpg"
          alt="Handwritten annual review pages spread on a wooden table"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 md:py-12 max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">A Note on Handwriting</h1>

        <div className="prose prose-lg dark:prose-invert mb-8">
          <p className="leading-relaxed mb-4">
            I do my annual review by hand—pen on paper. There's something about the physical motion
            that changes how I think. Writing slowly gives me space to pause, to let thoughts fully
            form before committing them to the page.
          </p>
          <p className="leading-relaxed mb-4">
            Later, I transcribe everything into a digital format. This second pass often reveals
            connections I missed the first time, and gives me a chance to refine what I really meant to say.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            This two-step process takes more time, but it's how I do my most rigorous thinking.
            You're welcome to follow along digitally—this tool works either way.
          </p>
        </div>

        {/* Mode selection */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">How would you like to do this review?</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => onContinue('handwriting')}
              className="text-lg px-6 flex-1"
            >
              <PenLine className="mr-2 h-5 w-5" />
              Handwriting Mode
            </Button>
            <Button
              size="lg"
              onClick={() => onContinue('digital')}
              className="text-lg px-6 flex-1"
            >
              <Monitor className="mr-2 h-5 w-5" />
              Digital Mode
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Handwriting mode shows prompts without text fields. You can transcribe later.
          </p>
        </div>
      </div>
    </div>
  )
}
