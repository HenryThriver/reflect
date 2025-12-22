import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTemplate } from '@/lib/templates'
import { ReviewFlow } from '@/components/review/review-flow'
import { createClient } from '@/lib/supabase/server'

const baseUrl = 'https://reflect.thrivinghenry.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateSlug: string }>
}): Promise<Metadata> {
  const { templateSlug } = await params
  const template = getTemplate(templateSlug)

  const title = template ? `${template.name} | Reflect` : 'Annual Review | Reflect'
  const description = template
    ? `${template.intro.description.slice(0, 150)}...`
    : 'A thoughtful annual review to reflect on your year and plan for the next.'
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

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ templateSlug: string }>
}) {
  const { templateSlug } = await params
  const template = getTemplate(templateSlug)

  // Redirect to templates page if template not found
  if (!template) {
    redirect('/templates')
  }

  // Check auth status
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <ReviewFlow template={template} user={user ? { id: user.id } : null} />
}
