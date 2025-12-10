import { redirect } from 'next/navigation'
import { getTemplate } from '@/lib/templates'
import { ReviewFlow } from '@/components/review/review-flow'
import { createClient } from '@/lib/supabase/server'

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

  return <ReviewFlow template={template} isAuthenticated={!!user} />
}
