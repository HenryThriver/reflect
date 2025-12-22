'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getTemplate } from '@/lib/templates'
import { getGuestReview, clearGuestReview } from '@/lib/guest-storage'
import { generateMarkdown, downloadMarkdown } from '@/lib/markdown/generator'
import { VALUE_FOREST_QUESTION_COUNT } from '@/lib/value-trees/constants'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { DividerWithText } from '@/components/ui/divider-with-text'
import { Download, Vault, Check, ArrowLeft, Cloud, Globe, Sparkles, History, AlertCircle } from 'lucide-react'
import { checkoutWithStripe } from '@/lib/stripe/actions'

export default function CompletionPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>
}) {
  const { templateSlug } = use(params)
  const searchParams = useSearchParams()
  const template = getTemplate(templateSlug)
  const [guestReview, setGuestReview] = useState<ReturnType<typeof getGuestReview>>(null)
  const [isClient, setIsClient] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const error = searchParams.get('error')
  const errorMessages: Record<string, string> = {
    checkout_failed: 'Unable to start checkout. Please try again.',
    no_email: 'Your account needs an email address to subscribe.',
    config_error: 'Service temporarily unavailable. Please try again later.',
    database_error: 'Something went wrong. Please try again.',
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional SSR hydration pattern
    setIsClient(true)
    setGuestReview(getGuestReview(templateSlug))
  }, [templateSlug])

  const handleDownload = () => {
    if (!template || !guestReview) return
    const markdown = generateMarkdown(
      template,
      guestReview.responses,
      new Date()
    )
    const year = new Date().getFullYear()
    const filename = `${template.slug}-${year}.md`
    downloadMarkdown(markdown, filename)
    setIsDownloaded(true)
  }

  const handleStartNew = () => {
    clearGuestReview(templateSlug)
    window.location.href = `/review/${templateSlug}`
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Template not found</p>
      </div>
    )
  }

  if (!isClient) {
    return <LoadingState />
  }

  const responses = guestReview?.responses ?? {}
  const answeredCount = Object.values(responses).filter((r) => r.trim()).length

  // For Henry's template, add Value Forest questions to total count
  const isHenryTemplate = template.slug === 'henry-finkelstein'
  const totalQuestions = isHenryTemplate
    ? template.questions.length + VALUE_FOREST_QUESTION_COUNT
    : template.questions.length

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Review Complete!</h1>
          <p className="text-muted-foreground">
            You finished {template.name} and answered {answeredCount} of{' '}
            {totalQuestions} questions.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Download button */}
          <Button
            onClick={handleDownload}
            size="lg"
            variant={isDownloaded ? 'outline' : 'default'}
            className="w-full"
          >
            {isDownloaded ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download as Markdown
              </>
            )}
          </Button>

          <DividerWithText className="my-4">or</DividerWithText>

          {/* Error message */}
          {error && errorMessages[error] && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessages[error]}</span>
            </div>
          )}

          {/* Upgrade CTA */}
          <form action={checkoutWithStripe}>
            <input type="hidden" name="returnTo" value={`/review/${templateSlug}/complete`} />
            <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Vault className="w-5 h-5 mr-2" />
              Save to Vault — $5/month
            </Button>
          </form>

          <div className="text-sm text-muted-foreground space-y-3 mt-4">
            <p className="text-center">Store your reflections securely in the cloud.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p className="flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                Cloud backup
              </p>
              <p className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Access anywhere
              </p>
              <p className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Time capsule
              </p>
              <p className="flex items-center gap-1">
                <History className="w-3 h-3" />
                Multi-year history
              </p>
            </div>
          </div>
        </div>

        {/* Secondary actions */}
        <div className="pt-4 border-t space-y-3">
          <Button
            variant="ghost"
            onClick={handleStartNew}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start This Review Fresh
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/templates">
              Try a Different Template
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
