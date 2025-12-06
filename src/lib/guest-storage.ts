const STORAGE_KEY = 'guest-annual-review'

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

function getStorage(): GuestStorage {
  if (typeof window === 'undefined') return { reviews: {} }
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : { reviews: {} }
}

function setStorage(data: GuestStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
