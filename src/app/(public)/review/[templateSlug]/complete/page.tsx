import { createClient } from '@/lib/supabase/server'
import { getTemplate } from '@/lib/templates'
import { CompletionPageClient } from './client'

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
