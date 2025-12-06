import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllTemplates } from '@/lib/templates'
import { ArrowRight, Lock, Download, Sparkles, Clock, Users } from 'lucide-react'

export default function HomePage() {
  const templates = getAllTemplates()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Your Year in Reflection
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete curated annual reviews from leading thinkers. Download for
            free, or lock your reflections in a time capsule to reveal next year.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/templates">
                Start Your Review
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose a Template</h3>
              <p className="text-muted-foreground">
                Pick from curated annual reviews by Dr. Anthony Gustin, Tiago
                Forte, Ness Labs, and more.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reflect Deeply</h3>
              <p className="text-muted-foreground">
                Take your time with thoughtful questions. One at a time,
                full-screen, distraction-free.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Download or Vault</h3>
              <p className="text-muted-foreground">
                Get your review as markdown for free, or save it to your vault
                for a magical reveal next year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates preview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Curated Templates
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Each template offers a unique approach to annual reflection,
            crafted by leading thinkers and creators.
          </p>
          <div className="grid gap-6">
            {templates.map((template) => (
              <Link
                key={template.slug}
                href={`/review/${template.slug}`}
                className="group block p-6 border rounded-xl hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {template.creator.name}
                      {template.creator.title && ` · ${template.creator.title}`}
                    </p>
                    <p className="text-muted-foreground line-clamp-2">
                      {template.intro.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span>{template.questions.length} questions</span>
                  <span>~{template.intro.estimatedMinutes} min</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/templates">View All Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Vault feature */}
      <section className="py-16 px-6 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Premium Feature
          </div>
          <h2 className="text-3xl font-bold mb-4">The Vault Experience</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your annual review becomes a time capsule. Lock it away and receive
            a magical reveal ceremony next December—a letter from past-you to
            future-you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
              <span>Locks Jan 11</span>
            </div>
            <div className="text-2xl">→</div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <span>Unlocks Dec 12</span>
            </div>
          </div>
          <Button asChild size="lg">
            <Link href="/pricing">
              Unlock the Vault — $5/mo
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>Annual Review Vault</div>
          <div className="flex items-center gap-6">
            <Link href="/templates" className="hover:text-foreground">
              Templates
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
