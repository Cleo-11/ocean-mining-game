import { ethers } from "ethers"
import { verifyWalletSignature } from "./moralis-service"
import { getUserByWallet, createUser, updateUser, getPlayerProgress, createPlayerProgress } from "./supabase-service"
import { isSupabaseAvailable } from "./supabase-config"

// Generate a nonce for signing
export function generateNonce() {
  return Math.floor(Math.random() * 1000000).toString()
}

// Create a message for the user to sign
export function createSignMessage(address: string, nonce: string) {
  return `Welcome to Ocean Mining Game!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${address}\nNonce: ${nonce}\n\nThis signature will not trigger a blockchain transaction or cost any gas fees.`
}

// Verify the signature from the wallet
export async function verifySignature(message: string, signature: string, address: string) {
  try {
    // Try to use Moralis for verification first
    try {
      return await verifyWalletSignature(message, signature, address)
    } catch (error) {
      console.warn("Moralis signature verification failed, falling back to ethers:", error)
      // Fallback to ethers.js
      const signerAddress = ethers.verifyMessage(message, signature)
      return signerAddress.toLowerCase() === address.toLowerCase()
    }
  } catch (error) {
    console.error("Signature verification failed:", error)
    return false
  }
}

// Generate a simple session token (in production, use proper JWT)
export function generateSessionToken(walletAddress: string, username: string) {
  const payload = {
    walletAddress,
    username,
    timestamp: Date.now(),
  }
  return btoa(JSON.stringify(payload))
}

// Verify session token
export function verifySessionToken(token: string) {
  try {
    const payload = JSON.parse(atob(token))
    // Check if token is less than 7 days old
    const isValid = Date.now() - payload.timestamp < 7 * 24 * 60 * 60 * 1000
    return isValid ? payload : null
  } catch (error) {
    return null
  }
}

// Handle user authentication with Moralis for verification and Supabase for storage
export async function authenticateUser(walletAddress: string, signature: string, message: string, username: string) {
  // Verify the signature
  const isValid = await verifySignature(message, signature, walletAddress)
  if (!isValid) {
    throw new Error("Invalid signature")
  }

  // Check if Supabase is available
  let supabaseAvailable = false
  try {
    supabaseAvailable = await isSupabaseAvailable()
  } catch (error) {
    console.warn("Supabase not available, using local authentication:", error)
    supabaseAvailable = false
  }

  if (!supabaseAvailable) {
    // Generate session token without Supabase
    const token = generateSessionToken(walletAddress, username)
    return {
      token,
      user: {
        walletAddress,
        username,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
      },
    }
  }

  // Supabase is available, proceed with normal flow
  try {
    // Check if user exists
    let user = await getUserByWallet(walletAddress)

    if (!user) {
      // Create new user
      user = await createUser({
        walletAddress,
        username,
        preferences: {
          soundEnabled: true,
          musicVolume: 0.7,
          sfxVolume: 0.8,
          graphics: "medium",
          autoSave: true,
        },
      })

      // Create initial player progress
      await createPlayerProgress(walletAddress)
    } else {
      // Update last login
      await updateUser(walletAddress, { lastLogin: new Date() })
    }

    // Check if player progress exists, create if not
    const playerProgress = await getPlayerProgress(walletAddress)
    if (!playerProgress) {
      await createPlayerProgress(walletAddress)
    }

    // Generate session token
    const token = generateSessionToken(walletAddress, user.username)

    return {
      token,
      user,
    }
  } catch (error) {
    console.error("Supabase authentication failed, falling back to local auth:", error)
    // Fallback to local authentication
    const token = generateSessionToken(walletAddress, username)
    return {
      token,
      user: {
        walletAddress,
        username,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
      },
    }
  }
}
