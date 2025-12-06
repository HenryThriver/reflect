import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export function EmptyState() {
  return (
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
  )
}
