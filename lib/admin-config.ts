// ✅ Capture env vars at build time
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY
const NEXT_PUBLIC_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY
const DEFAULT_ADMIN_KEY = "ocean-mining-admin-2024"

const ADMIN_KEYS = [
  ADMIN_SECRET_KEY,
  NEXT_PUBLIC_ADMIN_KEY,
  DEFAULT_ADMIN_KEY, // Default fallback key
]

export function validateAdminKey(inputKey: string): boolean {
  if (!inputKey || inputKey.length < 8) {
    return false
  }

  // Check against configured admin keys
  return ADMIN_KEYS.some((key) => key && key === inputKey)
}

export function getDefaultAdminKey(): string {
  return DEFAULT_ADMIN_KEY
}

export function getAdminConfig() {
  return {
    hasCustomKey: !!(ADMIN_SECRET_KEY || NEXT_PUBLIC_ADMIN_KEY),
    defaultKey: DEFAULT_ADMIN_KEY,
    availableKeys: ADMIN_KEYS.filter(Boolean).length,
  }
}

export function generateAdminKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = "ocean-admin-"
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
