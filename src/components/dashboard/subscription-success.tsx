'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

export function SubscriptionSuccess() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Auto-dismiss after 5 seconds - URL cleanup is unnecessary (YAGNI)
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle className="text-green-800 dark:text-green-200">
        Subscription Activated
      </AlertTitle>
      <AlertDescription className="text-green-700 dark:text-green-300">
        Your subscription is now active. All your reviews will be saved securely.
      </AlertDescription>
    </Alert>
  )
}
