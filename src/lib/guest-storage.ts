const STORAGE_KEY = 'guest-annual-review'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB
const DEBOUNCE_MS = 500

export interface GuestReview {
  templateSlug: string
  currentQuestionIndex: number
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
      console.error('Guest storage quota exceeded, clearing storage')
      localStorage.removeItem(STORAGE_KEY)
      storageCache = { reviews: {} }
      return storageCache
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save guest storage:', error)
    }
    pendingWrite = null
  }, DEBOUNCE_MS)
}

// Force immediate write (call before navigation)
export function flushStorage(): void {
  if (pendingWrite && storageCache) {
    clearTimeout(pendingWrite)
    pendingWrite = null
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
    currentQuestionIndex: 0,
    responses: {},
    startedAt: new Date().toISOString(),
    completedAt: null,
  }
  storage.reviews[templateSlug] = review
  setStorage(storage)
  return review
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
  localStorage.removeItem(STORAGE_KEY)
}
