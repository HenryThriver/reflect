import { AlertCircle } from 'lucide-react'

interface ErrorAlertProps {
  message: string | null
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null

  return (
    <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      {message}
    </div>
  )
}
