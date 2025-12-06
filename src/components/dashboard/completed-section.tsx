import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, Lock } from 'lucide-react'
import { ReviewWithProgress } from '@/lib/database.types'

interface CompletedSectionProps {
  reviews: ReviewWithProgress[]
}

export function CompletedSection({ reviews }: CompletedSectionProps) {
  if (reviews.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        Completed Reviews
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
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
  )
}
