<<<<<<< HEAD
// ✅ Capture env vars at build time
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY
const NEXT_PUBLIC_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY

const DEFAULT_ADMIN_KEY = "ocean-mining-admin-2024"
=======
// Simple admin key configuration
// In production, use a proper authentication system

const ADMIN_KEYS = [
  process.env.ADMIN_SECRET_KEY,
  process.env.NEXT_PUBLIC_ADMIN_KEY,
  "ocean-mining-admin-2024", // Default fallback key
]
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e

export function validateAdminKey(inputKey: string): boolean {
  if (!inputKey || inputKey.length < 8) {
    return false
  }

<<<<<<< HEAD
  // Check against custom admin keys
  if (ADMIN_SECRET_KEY && inputKey === ADMIN_SECRET_KEY) {
    return true
  }

  if (NEXT_PUBLIC_ADMIN_KEY && inputKey === NEXT_PUBLIC_ADMIN_KEY) {
    return true
  }

  // Check against default key
  if (inputKey === DEFAULT_ADMIN_KEY) {
    return true
  }

  return false
}

export function getDefaultAdminKey(): string {
  return DEFAULT_ADMIN_KEY
}

export function getAdminConfig() {
  return {
    hasCustomKey: !!(ADMIN_SECRET_KEY || NEXT_PUBLIC_ADMIN_KEY),
    defaultKey: DEFAULT_ADMIN_KEY,
  }
=======
  // Check against configured admin keys
  return ADMIN_KEYS.some((key) => key && key === inputKey)
}

export function getDefaultAdminKey(): string {
  return process.env.ADMIN_SECRET_KEY || process.env.NEXT_PUBLIC_ADMIN_KEY || "ocean-mining-admin-2024"
}

export function generateAdminKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = "ocean-admin-"
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
}
