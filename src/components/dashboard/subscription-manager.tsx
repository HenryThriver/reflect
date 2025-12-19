import { Card, CardContent } from '@/components/ui/card'
import { SubmitButton } from '@/components/ui/submit-button'
import { CheckCircle, Settings } from 'lucide-react'
import { createPortalSession } from '@/lib/stripe/actions'
import { Subscription } from '@/lib/database.types'

interface SubscriptionManagerProps {
  subscription: Subscription | null
}

export function SubscriptionManager({ subscription }: SubscriptionManagerProps) {
  if (!subscription) return null

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold">Subscription Active</h3>
            <p className="text-sm text-muted-foreground">
              {periodEnd
                ? subscription.cancel_at_period_end
                  ? `Cancels on ${periodEnd}`
                  : `Renews on ${periodEnd}`
                : 'Active subscription'}
            </p>
          </div>
        </div>
        <form action={createPortalSession}>
          <SubmitButton variant="outline" pendingText="Loading...">
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
