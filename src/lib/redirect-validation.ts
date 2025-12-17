// Centralized redirect validation to prevent open redirect attacks

// Allowed redirect paths - add new paths here as needed
export const ALLOWED_REDIRECTS = [
  '/dashboard',
  '/vault',
  '/templates',
  '/pricing',
  '/review',
  '/account',
]

/**
 * Validates that a redirect path is safe and internal-only.
 * Prevents open redirect vulnerabilities by:
 * - Rejecting absolute URLs (could redirect to external sites)
 * - Rejecting path traversal attempts
 * - Only allowing whitelisted path prefixes
 */
export function isValidRedirect(path: string): boolean {
  // Reject absolute URLs (could redirect to external sites)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return false
  }
  // Reject path traversal attempts
  if (path.includes('..')) {
    return false
  }
  // Must start with an allowed prefix
  return ALLOWED_REDIRECTS.some((allowed) => path.startsWith(allowed))
}

/**
 * Safely resolves a redirect path, falling back to default if invalid.
 */
export function getSafeRedirect(path: string | null, defaultPath = '/dashboard'): string {
  if (!path) return defaultPath
  return isValidRedirect(path) ? path : defaultPath
}
