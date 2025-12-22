import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getTemplate } from '@/lib/templates'
import { CompletionPageClient } from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thrivinghenry.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateSlug: string }>
}): Promise<Metadata> {
  const { templateSlug } = await params
  const template = getTemplate(templateSlug)
  const title = template ? `Completed: ${template.name}` : 'Review Complete'
  const description = 'I just completed my annual review. This document is a gift to my future self.'
  const ogImage = `${baseUrl}/images/handwritten-review.jpg`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function CompletionPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>
}) {
  const { templateSlug } = await params
  const template = getTemplate(templateSlug)

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Template not found</p>
      </div>
    )
  }

  // Get auth state server-side
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check subscription status
  let hasSubscription = false
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    hasSubscription = !!subscription
  }

  return (
    <CompletionPageClient
      templateSlug={templateSlug}
      template={template}
      hasSubscription={hasSubscription}
    />
  )
}
