// ✅ Capture env vars at build time
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY
const NEXT_PUBLIC_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY

const DEFAULT_ADMIN_KEY = "ocean-mining-admin-2024"

export function validateAdminKey(inputKey: string): boolean {
  if (!inputKey || inputKey.length < 8) {
    return false
  }

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
}
