import { randomBytes } from "crypto"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

interface Keys {
  JWT_SECRET: string
  ADMIN_SECRET_KEY: string
}

// Path to store persistent keys (outside of version control)
const KEYS_FILE_PATH = join(process.cwd(), ".keys.json")

// Generate a secure random key
function generateSecureKey(bytes = 32): string {
  return randomBytes(bytes).toString("hex")
}

// Get or create keys
export function getSecurityKeys(): Keys {
  // If environment variables are set, use them (highest priority)
  if (process.env.JWT_SECRET && process.env.ADMIN_SECRET_KEY) {
    return {
      JWT_SECRET: process.env.JWT_SECRET,
      ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
    }
  }

  try {
    // Check if we have stored keys
    if (existsSync(KEYS_FILE_PATH)) {
      const keysData = readFileSync(KEYS_FILE_PATH, "utf8")
      const keys = JSON.parse(keysData) as Keys

      // Validate keys format
      if (keys.JWT_SECRET && keys.ADMIN_SECRET_KEY) {
        return keys
      }
    }
  } catch (error) {
    console.warn("Error reading stored keys:", error)
    // Continue to generate new keys
  }

  // Generate new keys
  const newKeys: Keys = {
    JWT_SECRET: generateSecureKey(),
    ADMIN_SECRET_KEY: generateSecureKey(),
  }

  // Store the keys for future use
  try {
    writeFileSync(KEYS_FILE_PATH, JSON.stringify(newKeys, null, 2))
    console.log("✅ Generated and stored new security keys")
    console.log("📁 Keys stored in:", KEYS_FILE_PATH)
  } catch (error) {
    console.warn("⚠️ Failed to store security keys:", error)
    console.warn("🔄 Keys will be regenerated on next restart")
  }

  return newKeys
}

// Get a specific key
export function getKey(keyName: keyof Keys): string {
  const keys = getSecurityKeys()
  return keys[keyName]
}

// Utility function to generate a single secure key (for manual generation)
export function generateSingleKey(bytes = 32): string {
  return generateSecureKey(bytes)
}
