// Environment variable validation
// Provides runtime environment variable access with fail-fast behavior

const requiredServerEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_MONTHLY',
] as const

const requiredPublicEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const

type ServerEnvVar = (typeof requiredServerEnvVars)[number]
type PublicEnvVar = (typeof requiredPublicEnvVars)[number]

// Available for manual validation at app startup if needed
// Currently, validation happens lazily via getServerEnv() and getPublicEnv()
export function validateServerEnv(): void {
  const missing: string[] = []

  requiredServerEnvVars.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables:\n${missing.join('\n')}`
    )
  }
}

export function validatePublicEnv(): void {
  const missing: string[] = []

  requiredPublicEnvVars.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    throw new Error(
      `Missing required public environment variables:\n${missing.join('\n')}`
    )
  }
}

export function getServerEnv(key: ServerEnvVar): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}`)
  }
  return value
}

export function getPublicEnv(key: PublicEnvVar): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required public environment variable: ${key}`)
  }
  return value
}
