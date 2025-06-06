// Simple admin key configuration
// In production, use a proper authentication system

const ADMIN_KEYS = [
  process.env.ADMIN_SECRET_KEY,
  process.env.NEXT_PUBLIC_ADMIN_KEY,
  "ocean-mining-admin-2024", // Default fallback key
]

export function validateAdminKey(inputKey: string): boolean {
  if (!inputKey || inputKey.length < 8) {
    return false
  }

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
}
