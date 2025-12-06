import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllTemplates, getTemplate } from '@/lib/templates'
import { calculateProgress } from '@/lib/utils'
import { Subscription, AnnualReview } from '@/lib/database.types'
import { SubscriptionBanner } from '@/components/dashboard/subscription-banner'
import { InProgressSection } from '@/components/dashboard/in-progress-section'
import { CompletedSection } from '@/components/dashboard/completed-section'
import { NewReviewSection } from '@/components/dashboard/new-review-section'
import { EmptyState } from '@/components/dashboard/empty-state'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    redirect('/login')
  }

  // Fetch subscription status and annual reviews in parallel
  const [{ data: subscription }, { data: reviews }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single<Subscription>(),
    supabase
      .from('annual_reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<AnnualReview[]>(),
  ])

  const isSubscribed = subscription?.status === 'active'
  const templates = getAllTemplates()
  const currentYear = new Date().getFullYear()

  // Calculate progress for each review
  const reviewsWithProgress = (reviews || []).map((review) => {
    const template = getTemplate(review.template_slug)
    const totalQuestions = template?.questions.length || 1
    const answeredQuestions = Object.keys(review.responses).length
    const progress = calculateProgress(answeredQuestions, totalQuestions)
    return { ...review, template, progress, totalQuestions, answeredQuestions }
  })

  const inProgressReviews = reviewsWithProgress.filter(
    (r) => r.status === 'draft' && r.progress < 100
  )
  const completedReviews = reviewsWithProgress.filter(
    (r) => r.status !== 'draft' || r.progress === 100
  )

  return (
    <div className="space-y-8">
      {/* Subscription Banner */}
      {!isSubscribed && <SubscriptionBanner />}

      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-1">
          {isSubscribed
            ? 'Your reviews are saved securely in your vault.'
            : 'Start a review below or upgrade to save your progress.'}
        </p>
      </div>

      {/* In Progress Reviews */}
      <InProgressSection reviews={inProgressReviews} />

      {/* Completed Reviews */}
      <CompletedSection reviews={completedReviews} />

      {/* Start New Review */}
      <NewReviewSection
        templates={templates}
        reviews={reviews}
        currentYear={currentYear}
        isSubscribed={isSubscribed}
      />

      {/* Empty State - Only show when there are NO reviews at all */}
      {(!reviews || reviews.length === 0) && <EmptyState />}
    </div>
  )
}
