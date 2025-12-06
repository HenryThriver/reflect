import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock } from 'lucide-react'
import { AnnualReview } from '@/lib/database.types'
import { ReviewTemplate } from '@/lib/templates'

interface ReviewWithProgress extends AnnualReview {
  template: ReviewTemplate | undefined
  progress: number
  totalQuestions: number
  answeredQuestions: number
}

interface InProgressSectionProps {
  reviews: ReviewWithProgress[]
}

export function InProgressSection({ reviews }: InProgressSectionProps) {
  if (reviews.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-500" />
        In Progress
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
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
  )
}
