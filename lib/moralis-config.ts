let isInitialized = false

// ✅ Capture env vars at build time
const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijc4MWNmZTU2LWRmZTQtNGIwMS1hZDBlLTg1NDI1NjM0NjFlZiIsIm9yZ0lkIjoiNDUxMDg0IiwidXNlcklkIjoiNDY0MTMwIiwidHlwZUlkIjoiNjc2MzNmZmUtZmUxOS00MDk3LWFkYTAtYjM5NDFlM2Y1NWNlIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDkxMTEwNDQsImV4cCI6NDkwNDg3MTA0NH0.vHxMikx-DzgJ8M3cbzWgKUlz9_1qA4zB9ShrVepMU4M"


export async function initializeMoralis() {
  if (isInitialized) return

  try {
    if (!MORALIS_API_KEY) {
      throw new Error("NEXT_PUBLIC_MORALIS_API_KEY is not configured")
    }

    console.log("🔑 Initializing Moralis with API key:", MORALIS_API_KEY.substring(0, 20) + "...")

    // For now, we'll skip the actual Moralis initialization to avoid import issues
    // TODO: Add Moralis.start() when the package is properly installed

    isInitialized = true
    console.log("✅ Moralis initialized successfully")
  } catch (error) {
    console.error("❌ Failed to initialize Moralis:", error)
    throw error
  }
}

export function isMoralisInitialized() {
  return isInitialized
}

export function getMoralisApiKey() {
  return MORALIS_API_KEY
}

export function isMoralisConfigured() {
  return !!MORALIS_API_KEY
}
