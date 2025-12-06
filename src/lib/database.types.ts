// Database types for Supabase tables

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'inactive'
  price_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface AnnualReview {
  id: string
  user_id: string
  template_slug: string
  year: number
  status: 'draft' | 'locked' | 'unlocked'
  current_question_index: number
  responses: Record<string, string>
  created_at: string
  updated_at: string
}

// Extended type for dashboard views with computed progress fields
export interface ReviewWithProgress extends AnnualReview {
  template: import('@/lib/templates').ReviewTemplate | undefined
  progress: number
  totalQuestions: number
  answeredQuestions: number
}
