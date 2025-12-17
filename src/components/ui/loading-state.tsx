import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

/**
 * Consistent loading state component for the application.
 * Use fullScreen={true} for page-level loading states.
 */
export function LoadingState({
  message = 'Loading...',
  fullScreen = true,
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}
