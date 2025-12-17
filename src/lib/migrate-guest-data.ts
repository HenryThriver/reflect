import { createClient } from '@/lib/supabase/client'
import { getAllGuestReviews, clearAllGuestReviews } from '@/lib/guest-storage'

export async function migrateGuestReviews(userId: string): Promise<{ migrated: number; errors: string[] }> {
  const supabase = createClient()
  const guestReviews = getAllGuestReviews()
  const errors: string[] = []
  let migrated = 0

  for (const [templateSlug, review] of Object.entries(guestReviews)) {
    try {
      const year = new Date(review.startedAt).getFullYear()

      // Check if already exists
      const { data: existing } = await supabase
        .from('annual_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('template_slug', templateSlug)
        .eq('year', year)
        .single()

      if (existing) {
        console.log(`Review for ${templateSlug} ${year} already exists, skipping`)
        continue
      }

      const { error } = await supabase.from('annual_reviews').insert({
        user_id: userId,
        template_slug: templateSlug,
        year,
        status: 'draft',
        current_question_index: review.currentQuestionIndex,
        responses: review.responses
      })

      if (error) {
        errors.push(`Failed to migrate ${templateSlug}: ${error.message}`)
      } else {
        migrated++
      }
    } catch (err) {
      errors.push(`Error migrating ${templateSlug}: ${err}`)
    }
  }

  // Only clear if all migrations succeeded
  if (errors.length === 0 && migrated > 0) {
    clearAllGuestReviews()
  }

  return { migrated, errors }
}
