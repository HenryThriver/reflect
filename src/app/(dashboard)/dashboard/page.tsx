import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllTemplates, getTemplate } from '@/lib/templates'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Subscription, AnnualReview } from '@/lib/database.types'
import {
  Plus,
  Clock,
  CheckCircle2,
  Lock,
  AlertCircle,
  Sparkles,
  FileText,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .single<Subscription>()

  // Fetch user's annual reviews
  const { data: reviews } = await supabase
    .from('annual_reviews')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .returns<AnnualReview[]>()

  const isSubscribed = subscription?.status === 'active'
  const templates = getAllTemplates()
  const currentYear = new Date().getFullYear()

  // Calculate progress for each review
  const reviewsWithProgress = (reviews || []).map((review) => {
    const template = getTemplate(review.template_slug)
    const totalQuestions = template?.questions.length || 1
    const answeredQuestions = Object.keys(review.responses).length
    const progress = Math.round((answeredQuestions / totalQuestions) * 100)
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
      {!isSubscribed && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold">Upgrade to save your reviews</h3>
                <p className="text-sm text-muted-foreground">
                  Free users can try reviews but need a subscription to save and
                  access the vault.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
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
      {inProgressReviews.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            In Progress
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {review.template?.name || review.template_slug}
                  </CardTitle>
                  <CardDescription>
                    {review.year} Review &middot; {review.answeredQuestions}/
                    {review.totalQuestions} questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={review.progress} className="h-2 mb-4" />
                  <Button asChild className="w-full">
                    <Link href={`/vault/review/${review.id}`}>Continue</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Completed Reviews */}
      {completedReviews.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Completed Reviews
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {review.template?.name || review.template_slug}
                    </CardTitle>
                    {review.status === 'locked' && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>{review.year} Review</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/vault/review/${review.id}`}>View Review</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Start New Review */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Start a New Review
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            // Check if user already has a review for this template this year
            const existingReview = reviews?.find(
              (r) =>
                r.template_slug === template.slug && r.year === currentYear
            )

            return (
              <Card key={template.slug}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>
                    By {template.creator.name} &middot;{' '}
                    {template.intro.estimatedMinutes} min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.intro.description}
                  </p>
                  {existingReview ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      Already started for {currentYear}
                    </div>
                  ) : isSubscribed ? (
                    <Button asChild className="w-full">
                      <Link href={`/vault/start/${template.slug}`}>
                        Start Review
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/review/${template.slug}`}>
                        Try Free Preview
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Empty State */}
      {(!reviews || reviews.length === 0) && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your first annual review to begin reflecting on your year.
            </p>
            <Button asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
