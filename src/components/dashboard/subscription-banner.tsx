import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export function SubscriptionBanner() {
  return (
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
  )
}
