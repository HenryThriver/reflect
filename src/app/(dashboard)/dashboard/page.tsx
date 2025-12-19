import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllTemplates, getTemplate, getTemplateQuestionCount } from '@/lib/templates'
import { calculateProgress } from '@/lib/utils'
import { Subscription, AnnualReview } from '@/lib/database.types'
import { SubscriptionBanner } from '@/components/dashboard/subscription-banner'
import { InProgressSection } from '@/components/dashboard/in-progress-section'
import { CompletedSection } from '@/components/dashboard/completed-section'
import { NewReviewSection } from '@/components/dashboard/new-review-section'
import { EmptyState } from '@/components/dashboard/empty-state'
import { SubscriptionManager } from '@/components/dashboard/subscription-manager'
import { SubscriptionSuccess } from '@/components/dashboard/subscription-success'

// Pagination limit for reviews to prevent unbounded JSONB processing
const MAX_REVIEWS_PER_PAGE = 50

interface DashboardPageProps {
  searchParams: Promise<{ subscription?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const showSuccess = params.subscription === 'success'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    redirect('/login')
  }

  // Fetch subscription status and annual reviews in parallel
  // Using maybeSingle() to handle case where user has no subscription yet
  const [subscriptionResult, reviewsResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, user_id, stripe_customer_id, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('annual_reviews')
      .select('id, user_id, template_slug, year, status, responses, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(MAX_REVIEWS_PER_PAGE),
  ])

  // Handle potential errors gracefully
  if (subscriptionResult.error) {
    console.error('Failed to fetch subscription:', subscriptionResult.error.message)
  }
  if (reviewsResult.error) {
    console.error('Failed to fetch reviews:', reviewsResult.error.message)
  }

  // Type assertion is safe here because maybeSingle returns null when no match
  const subscription = subscriptionResult.data as Subscription | null
  const reviews = (reviewsResult.data ?? []) as AnnualReview[]

  const isSubscribed = subscription?.status === 'active'
  const templates = getAllTemplates()
  const currentYear = new Date().getFullYear()

  // Calculate progress for each review using cached question counts
  const reviewsWithProgress = reviews.map((review) => {
    const template = getTemplate(review.template_slug)
    // Use cached question count for O(1) lookup
    const totalQuestions = getTemplateQuestionCount(review.template_slug) || 1
    const answeredQuestions = Object.keys(review.responses || {}).length
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
      {/* Subscription Success Message */}
      {showSuccess && <SubscriptionSuccess />}

      {/* Subscription Status */}
      {isSubscribed ? (
        <SubscriptionManager subscription={subscription} />
      ) : (
        <SubscriptionBanner />
      )}

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
      {reviews.length === 0 && <EmptyState />}
    </div>
  )
}
