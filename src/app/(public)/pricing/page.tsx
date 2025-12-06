import Link from 'next/link'
import { STRIPE_CONFIG } from '@/lib/stripe/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Pricing | Annual Review Vault',
  description: 'Complete reviews for free or unlock the vault for just $5/month.',
}

const features = {
  free: [
    { text: 'All review templates', included: true },
    { text: 'Complete full reviews', included: true },
    { text: 'Download as Markdown', included: true },
    { text: 'No account needed', included: true },
    { text: 'Save progress', included: false },
    { text: 'Time capsule vault', included: false },
    { text: 'Multi-year history', included: false },
  ],
  vault: [
    { text: 'Everything in Free', included: true },
    { text: 'Save progress anytime', included: true },
    { text: 'Resume across devices', included: true },
    { text: 'Time capsule vault', included: true },
    { text: 'Unlock ceremony', included: true },
    { text: 'Multi-year history', included: true },
    { text: 'Priority support', included: true },
  ],
}

export default function PricingPage() {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete your annual review for free. Or unlock the vault to save
            your reflections and reveal them next year.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for trying it out</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.free.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={!feature.included ? 'text-muted-foreground' : ''}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/templates">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Vault tier */}
          <Card className="border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Vault
              </CardTitle>
              <CardDescription>For the full experience</CardDescription>
              <div className="pt-4 space-y-1">
                <div>
                  <span className="text-4xl font-bold">$5</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  or $50/year <span className="text-green-600">(save $10)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.vault.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <a href={STRIPE_CONFIG.paymentLinks.monthly}>
                    Subscribe Monthly
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href={STRIPE_CONFIG.paymentLinks.yearly}>
                    Subscribe Yearly — Save $10
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vault explanation */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">What's the Vault?</h2>
          <p className="text-muted-foreground mb-6">
            The Vault is a time capsule for your reflections. When you complete
            your annual review, it gets locked away. Next December, you'll
            receive a celebratory unlock ceremony where past-you speaks to
            future-you.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">📝</div>
              <div className="font-medium">Complete</div>
              <div className="text-sm text-muted-foreground">Dec 12 - Jan 11</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <div className="font-medium">Lock</div>
              <div className="text-sm text-muted-foreground">~11 months</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🎉</div>
              <div className="font-medium">Unlock</div>
              <div className="text-sm text-muted-foreground">Next December</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Questions?</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-1">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes! Cancel anytime from your account settings. Your existing
                vaults will remain accessible.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">What happens to my vaults if I cancel?</h3>
              <p className="text-muted-foreground">
                Your completed and locked vaults remain yours. You just won't be
                able to create new ones until you resubscribe.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Can I try a review before paying?</h3>
              <p className="text-muted-foreground">
                Absolutely! Complete any review for free and download it. Only
                pay if you want the vault experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
