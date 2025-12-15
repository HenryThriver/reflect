const STORAGE_KEY = 'guest-annual-review'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB
const DEBOUNCE_MS = 500

export type FlowScreen = 'intro' | 'housekeeping' | 'handwriting' | 'centering' | 'questions'
export type ReviewMode = 'handwriting' | 'digital'

export interface GuestReview {
  templateSlug: string
  currentScreen: FlowScreen
  currentQuestionIndex: number
  reviewMode: ReviewMode
  responses: Record<string, string>
  startedAt: string
  completedAt: string | null
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
        const oldestIncomplete = reviews.find(([_, r]) => !r.completedAt)
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

    storageCache = JSON.parse(stored)
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
