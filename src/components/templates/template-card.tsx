'use client'

import Link from 'next/link'
import { ReviewTemplate } from '@/lib/templates/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight } from 'lucide-react'

interface TemplateCardProps {
  template: ReviewTemplate
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-1">{template.name}</CardTitle>
            <CardDescription className="text-sm">
              by {template.creator.name}
              {template.creator.title && (
                <span className="text-muted-foreground"> · {template.creator.title}</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {template.intro.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              ~{template.intro.estimatedMinutes} min
            </span>
            <span>{template.questions.length} questions</span>
          </div>

          <Button asChild variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
            <Link href={`/review/${template.slug}`}>
              Start
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
