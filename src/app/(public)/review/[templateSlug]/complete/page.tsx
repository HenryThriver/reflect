'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { getTemplate } from '@/lib/templates'
import { getGuestReview, clearGuestReview } from '@/lib/guest-storage'
import { generateMarkdown, downloadMarkdown } from '@/lib/markdown/generator'
import { Button } from '@/components/ui/button'
import { Download, Lock, Check, ArrowLeft, Sparkles } from 'lucide-react'

export default function CompletionPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>
}) {
  const { templateSlug } = use(params)
  const template = getTemplate(templateSlug)
  const [guestReview, setGuestReview] = useState<ReturnType<typeof getGuestReview>>(null)
  const [isClient, setIsClient] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  useEffect(() => {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const responses = guestReview?.responses ?? {}
  const answeredCount = Object.values(responses).filter((r) => r.trim()).length

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
            {template.questions.length} questions.
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Upgrade CTA */}
          <Button asChild size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link href="/pricing">
              <Lock className="w-5 h-5 mr-2" />
              Save to Vault — $5/mo
            </Link>
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              Lock your review for a year, then unlock it with a celebration
            </p>
            <p>Save progress • Resume anytime • Multi-year history</p>
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
