const STORAGE_KEY = 'guest-annual-review'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB
const DEBOUNCE_MS = 2000 // Debounce for localStorage writes
const AUTH_DEBOUNCE_MS = 2000 // Debounce for authenticated database writes

import { z } from 'zod'
import type { ValueForestState } from '@/lib/value-trees/types'
import { getDefaultForestState } from '@/lib/value-trees/constants'
import { createClient } from '@/lib/supabase/client'

export type FlowScreen = 'intro' | 'housekeeping' | 'handwriting' | 'centering' | 'questions' | 'value-forest' | 'visualization'
export type ReviewMode = 'handwriting' | 'digital'

// Zod schemas for runtime validation
const FlowScreenSchema = z.enum(['intro', 'housekeeping', 'handwriting', 'centering', 'questions', 'value-forest', 'visualization'])
const ReviewModeSchema = z.enum(['handwriting', 'digital'])

const ValueForestStateSchema = z.object({
  phase: z.enum(['intro', 'selection', 'deep-dive', 'ranking', 'overview']),
  selectedTreeIds: z.array(z.string()),
  customTrees: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    isCustom: z.boolean(),
  })),
  currentTreeIndex: z.number(),
  currentQuestionIndex: z.number(),
  responses: z.record(z.string(), z.object({
    scope: z.string().optional(),
    standards: z.string().optional(),
    proudOf: z.string().optional(),
    gratitude: z.string().optional(),
    heldBack: z.string().optional(),
    aspiration: z.string().optional(),
    helpNeeded: z.string().optional(),
    satisfaction: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
    skipped: z.boolean().optional(),
  })),
  ranking: z.array(z.string()),
  overviewResponses: z.record(z.string(), z.string()),
}).partial() // Make all fields optional for partial state recovery

const GuestReviewSchema = z.object({
  templateSlug: z.string(),
  currentScreen: FlowScreenSchema,
  currentQuestionIndex: z.number(),
  reviewMode: ReviewModeSchema,
  responses: z.record(z.string(), z.string()),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  // ValueForestState is validated with partial schema for recovery but typed correctly
  valueForest: ValueForestStateSchema.optional(),
})

const GuestStorageSchema = z.object({
  reviews: z.record(z.string(), GuestReviewSchema),
})

// Types explicitly defined to match expected runtime values
// Note: Zod schema uses partial for valueForest to enable recovery from corrupt data
export interface GuestReview {
  templateSlug: string
  currentScreen: FlowScreen
  currentQuestionIndex: number
  reviewMode: ReviewMode
  responses: Record<string, string>
  startedAt: string
  completedAt: string | null
  valueForest?: ValueForestState
}

export interface GuestStorage {
  reviews: Record<string, GuestReview>
}

// Cache to avoid repeated JSON.parse on every operation
let storageCache: GuestStorage | null = null
let pendingWrite: ReturnType<typeof setTimeout> | null = null

function getStorage(): GuestStorage {
  if (typeof window === 'undefined') return { reviews: {} }

  // Return cached value if available
  if (storageCache) return storageCache

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      storageCache = { reviews: {} }
      return storageCache
    }

    // Check size before parsing
    if (stored.length > MAX_STORAGE_SIZE) {
      console.warn('Guest storage approaching quota limit')
      // Try to parse and remove oldest incomplete review
      try {
        const data = JSON.parse(stored) as GuestStorage
        const reviews = Object.entries(data.reviews)

        // Sort by startedAt, oldest first
        reviews.sort((a, b) =>
          new Date(a[1].startedAt).getTime() - new Date(b[1].startedAt).getTime()
        )

        // Remove oldest incomplete review (keep completed ones if possible)
        const oldestIncomplete = reviews.find(([, r]) => !r.completedAt)
        if (oldestIncomplete) {
          console.warn(`Removing oldest incomplete review: ${oldestIncomplete[0]}`)
          delete data.reviews[oldestIncomplete[0]]
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          storageCache = data
          return storageCache
        }

        // If all are complete, remove the oldest one
        if (reviews.length > 0) {
          console.warn(`Removing oldest review: ${reviews[0][0]}`)
          delete data.reviews[reviews[0][0]]
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          storageCache = data
          return storageCache
        }
      } catch {
        // If parsing fails, clear and start fresh
        localStorage.removeItem(STORAGE_KEY)
        storageCache = { reviews: {} }
        return storageCache
      }
    }

    const parsed = JSON.parse(stored)
    // Validate parsed data against schema
    const result = GuestStorageSchema.safeParse(parsed)
    if (result.success) {
      storageCache = result.data as GuestStorage
    } else {
      console.warn('Invalid localStorage data, using parsed with fallbacks:', result.error.issues)
      // Try to salvage what we can - use parsed data but default missing fields
      storageCache = {
        reviews: typeof parsed?.reviews === 'object' ? parsed.reviews : {},
      }
    }
    return storageCache!
  } catch (error) {
    console.error('Failed to parse guest storage:', error)
    localStorage.removeItem(STORAGE_KEY)
    storageCache = { reviews: {} }
    return storageCache
  }
}

function setStorage(data: GuestStorage): void {
  // Update cache immediately
  storageCache = data

  // Debounce writes to localStorage
  if (pendingWrite) {
    clearTimeout(pendingWrite)
  }

  pendingWrite = setTimeout(() => {
    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(STORAGE_KEY, serialized)
    } catch (error) {
      console.error('Failed to save guest storage:', error)
      // Emit custom event for UI to handle
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('guest-storage-error', {
          detail: { error: 'quota_exceeded' }
        }))
      }
    }
    pendingWrite = null
  }, DEBOUNCE_MS)
}

// Force immediate write (call before navigation)
export function flushStorage(): void {
  if (pendingWrite) {
    clearTimeout(pendingWrite)
    pendingWrite = null
  }

  if (storageCache && typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageCache))
    } catch (error) {
      console.error('Failed to flush guest storage:', error)
    }
  }
}

export function getGuestReview(templateSlug: string): GuestReview | null {
  return getStorage().reviews[templateSlug] ?? null
}

export function startGuestReview(templateSlug: string): GuestReview {
  const storage = getStorage()
  const review: GuestReview = {
    templateSlug,
    currentScreen: 'intro',
    currentQuestionIndex: 0,
    reviewMode: 'digital',
    responses: {},
    startedAt: new Date().toISOString(),
    completedAt: null,
  }
  storage.reviews[templateSlug] = review
  setStorage(storage)
  return review
}

export function setCurrentScreen(templateSlug: string, screen: FlowScreen): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.currentScreen = screen
  setStorage(storage)
}

export function setReviewMode(templateSlug: string, mode: ReviewMode): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.reviewMode = mode
  setStorage(storage)
}

export function saveGuestResponse(
  templateSlug: string,
  questionId: string,
  answer: string
): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.responses[questionId] = answer
  setStorage(storage)
}

export function setQuestionIndex(templateSlug: string, index: number): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.currentQuestionIndex = index
  setStorage(storage)
}

export function completeGuestReview(templateSlug: string): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.completedAt = new Date().toISOString()
  setStorage(storage)
}

export function clearGuestReview(templateSlug: string): void {
  const storage = getStorage()
  delete storage.reviews[templateSlug]
  setStorage(storage)
}

export function getAllGuestReviews(): Record<string, GuestReview> {
  return getStorage().reviews
}

export function clearAllGuestReviews(): void {
  const storage = getStorage()
  storage.reviews = {}
  setStorage(storage)
  flushStorage()
}

// Value Forest helpers
export function getValueForestState(templateSlug: string): ValueForestState {
  const review = getGuestReview(templateSlug)
  return review?.valueForest ?? getDefaultForestState()
}

export function saveValueForestState(templateSlug: string, state: ValueForestState): void {
  const storage = getStorage()
  const review = storage.reviews[templateSlug]
  if (!review) return
  review.valueForest = state
  setStorage(storage)
}

// Auto-flush on page visibility change or unload
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushStorage()
    }
  })

  window.addEventListener('beforeunload', () => {
    flushStorage()
  })

  window.addEventListener('pagehide', () => {
    flushStorage()
  })
}

// =============================================================================
// Authenticated User Storage (Database) - With Debouncing
// =============================================================================

// Result type for database operations
export interface DbOperationResult {
  success: boolean
  error?: string
}

// Debounce state for authenticated writes
let pendingAuthReviewWrite: ReturnType<typeof setTimeout> | null = null
let pendingAuthReviewData: {
  userId: string
  templateSlug: string
  year: number
  responses: Record<string, string>
  currentQuestionIndex: number
} | null = null

let pendingAuthProgressWrite: ReturnType<typeof setTimeout> | null = null
let pendingAuthProgressData: {
  userId: string
  templateSlug: string
  year: number
  currentQuestionIndex: number
} | null = null

// Event for notifying components of save errors
function dispatchAuthStorageError(error: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-storage-error', {
      detail: { error }
    }))
  }
}

// Internal function that performs the actual database write
async function _saveAuthenticatedReviewNow(
  userId: string,
  templateSlug: string,
  year: number,
  responses: Record<string, string>,
  currentQuestionIndex: number
): Promise<DbOperationResult> {
  const supabase = createClient()
  const { error } = await supabase.from('annual_reviews').upsert({
    user_id: userId,
    template_slug: templateSlug,
    year,
    responses,
    current_question_index: currentQuestionIndex,
    status: 'draft'
  }, { onConflict: 'user_id,template_slug,year' })

  if (error) {
    console.error('Failed to save authenticated review:', error)
    dispatchAuthStorageError(error.message)
    return { success: false, error: error.message }
  }
  return { success: true }
}

// Debounced version - use this for keystroke-by-keystroke saves
export function saveAuthenticatedReview(
  userId: string,
  templateSlug: string,
  year: number,
  responses: Record<string, string>,
  currentQuestionIndex: number
): void {
  // Store the latest data
  pendingAuthReviewData = { userId, templateSlug, year, responses, currentQuestionIndex }

  // Clear any pending write
  if (pendingAuthReviewWrite) {
    clearTimeout(pendingAuthReviewWrite)
  }

  // Schedule debounced write
  pendingAuthReviewWrite = setTimeout(async () => {
    if (pendingAuthReviewData) {
      await _saveAuthenticatedReviewNow(
        pendingAuthReviewData.userId,
        pendingAuthReviewData.templateSlug,
        pendingAuthReviewData.year,
        pendingAuthReviewData.responses,
        pendingAuthReviewData.currentQuestionIndex
      )
      pendingAuthReviewData = null
    }
    pendingAuthReviewWrite = null
  }, AUTH_DEBOUNCE_MS)
}

export async function loadAuthenticatedReview(
  userId: string,
  templateSlug: string,
  year: number
): Promise<{ responses: Record<string, string>; currentQuestionIndex: number; reviewMode?: ReviewMode } | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('annual_reviews')
    .select('responses, current_question_index, review_mode')
    .eq('user_id', userId)
    .eq('template_slug', templateSlug)
    .eq('year', year)
    .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully

  if (error || !data) return null

  return {
    responses: (data.responses as Record<string, string>) || {},
    currentQuestionIndex: data.current_question_index || 0,
    reviewMode: (data.review_mode as ReviewMode) || 'digital'
  }
}

// Internal function that performs the actual progress update
async function _updateAuthenticatedProgressNow(
  userId: string,
  templateSlug: string,
  year: number,
  currentQuestionIndex: number
): Promise<DbOperationResult> {
  const supabase = createClient()
  const { error } = await supabase
    .from('annual_reviews')
    .update({ current_question_index: currentQuestionIndex })
    .eq('user_id', userId)
    .eq('template_slug', templateSlug)
    .eq('year', year)

  if (error) {
    console.error('Failed to update progress:', error)
    dispatchAuthStorageError(error.message)
    return { success: false, error: error.message }
  }
  return { success: true }
}

// Debounced version - use this for navigation progress updates
export function updateAuthenticatedProgress(
  userId: string,
  templateSlug: string,
  year: number,
  currentQuestionIndex: number
): void {
  // Store the latest data
  pendingAuthProgressData = { userId, templateSlug, year, currentQuestionIndex }

  // Clear any pending write
  if (pendingAuthProgressWrite) {
    clearTimeout(pendingAuthProgressWrite)
  }

  // Schedule debounced write
  pendingAuthProgressWrite = setTimeout(async () => {
    if (pendingAuthProgressData) {
      await _updateAuthenticatedProgressNow(
        pendingAuthProgressData.userId,
        pendingAuthProgressData.templateSlug,
        pendingAuthProgressData.year,
        pendingAuthProgressData.currentQuestionIndex
      )
      pendingAuthProgressData = null
    }
    pendingAuthProgressWrite = null
  }, AUTH_DEBOUNCE_MS)
}

export async function startAuthenticatedReview(
  userId: string,
  templateSlug: string,
  year: number,
  reviewMode: ReviewMode
): Promise<DbOperationResult> {
  const supabase = createClient()
  const { error } = await supabase.from('annual_reviews').upsert({
    user_id: userId,
    template_slug: templateSlug,
    year,
    review_mode: reviewMode,
    responses: {},
    current_question_index: 0,
    status: 'draft'
  }, { onConflict: 'user_id,template_slug,year' })

  if (error) {
    console.error('Failed to start authenticated review:', error)
    dispatchAuthStorageError(error.message)
    return { success: false, error: error.message }
  }
  return { success: true }
}

// Force immediate flush of any pending authenticated writes (call before navigation)
export async function flushAuthenticatedStorage(): Promise<void> {
  // Flush pending review writes
  if (pendingAuthReviewWrite) {
    clearTimeout(pendingAuthReviewWrite)
    pendingAuthReviewWrite = null
  }
  if (pendingAuthReviewData) {
    await _saveAuthenticatedReviewNow(
      pendingAuthReviewData.userId,
      pendingAuthReviewData.templateSlug,
      pendingAuthReviewData.year,
      pendingAuthReviewData.responses,
      pendingAuthReviewData.currentQuestionIndex
    )
    pendingAuthReviewData = null
  }

  // Flush pending progress writes
  if (pendingAuthProgressWrite) {
    clearTimeout(pendingAuthProgressWrite)
    pendingAuthProgressWrite = null
  }
  if (pendingAuthProgressData) {
    await _updateAuthenticatedProgressNow(
      pendingAuthProgressData.userId,
      pendingAuthProgressData.templateSlug,
      pendingAuthProgressData.year,
      pendingAuthProgressData.currentQuestionIndex
    )
    pendingAuthProgressData = null
  }
}
