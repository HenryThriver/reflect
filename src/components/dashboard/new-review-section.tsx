import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, AlertCircle } from 'lucide-react'
import { ReviewTemplate } from '@/lib/templates'
import { AnnualReview } from '@/lib/database.types'

interface NewReviewSectionProps {
  templates: ReviewTemplate[]
  reviews: AnnualReview[] | null
  currentYear: number
  isSubscribed: boolean
}

export function NewReviewSection({
  templates,
  reviews,
  currentYear,
  isSubscribed,
}: NewReviewSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5" />
        Start a New Review
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          // Check if user already has a review for this template this year
          const existingReview = reviews?.find(
            (r) => r.template_slug === template.slug && r.year === currentYear
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
  )
}
