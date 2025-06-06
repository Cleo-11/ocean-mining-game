import Moralis from "moralis"

let isInitialized = false

export async function initializeMoralis() {
  if (isInitialized) return

  try {
    if (!process.env.NEXT_PUBLIC_MORALIS_API_KEY) {
      throw new Error("NEXT_PUBLIC_MORALIS_API_KEY is not configured")
    }

    await Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
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
