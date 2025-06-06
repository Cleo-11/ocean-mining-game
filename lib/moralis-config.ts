import Moralis from "moralis"

let isInitialized = false

<<<<<<< HEAD
// ✅ Capture env vars at build time
const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY

=======
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
export async function initializeMoralis() {
  if (isInitialized) return

  try {
<<<<<<< HEAD
    if (!MORALIS_API_KEY) {
      throw new Error("NEXT_PUBLIC_MORALIS_API_KEY is not configured")
    }

    console.log("🔑 Initializing Moralis with API key:", MORALIS_API_KEY.substring(0, 20) + "...")

    await Moralis.start({
      apiKey: MORALIS_API_KEY,
=======
    if (!process.env.NEXT_PUBLIC_MORALIS_API_KEY) {
      throw new Error("NEXT_PUBLIC_MORALIS_API_KEY is not configured")
    }

    await Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
    })

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
<<<<<<< HEAD

export function getMoralisApiKey() {
  return MORALIS_API_KEY
}
=======
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
