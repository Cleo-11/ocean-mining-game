<<<<<<< HEAD
import { initializeMoralis, isMoralisInitialized, getMoralisApiKey } from "./moralis-config"
import { createSupabaseClient, isSupabaseConfigured, getSupabaseConfig } from "./supabase-config"
import { supabaseService } from "./supabase-service"
import type { Player, LeaderboardEntry } from "./types"

// ✅ Capture env vars at build time
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL
const MULTIPLAYER_SERVER_URL = process.env.NEXT_PUBLIC_MULTIPLAYER_SERVER_URL

let servicesInitialized = false

export async function initializeServices() {
  if (servicesInitialized) return

  try {
    console.log("🚀 Initializing services...")

    // Initialize Moralis
    if (getMoralisApiKey()) {
      try {
        await initializeMoralis()
        console.log("✅ Moralis service initialized")
      } catch (error) {
        console.warn("⚠️ Moralis initialization failed:", error)
      }
    } else {
      console.warn("⚠️ Moralis API key not configured")
    }

    // Test Supabase connection
    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseClient()
        const { data, error } = await supabase.from("health_check").select("*").limit(1)
        if (error) throw error
        console.log("✅ Supabase service initialized")
      } catch (error) {
        console.warn("⚠️ Supabase connection failed:", error)
      }
    } else {
      console.warn("⚠️ Supabase not configured")
    }

    servicesInitialized = true
    console.log("🎉 Services initialization complete")
  } catch (error) {
    console.error("❌ Failed to initialize services:", error)
=======
// This file serves as a unified interface for database operations
// It will use Supabase for persistent storage and Moralis for Web3 functionality

import { isSupabaseAvailable } from "./supabase-config"
import { isMoralisAvailable } from "./moralis-config"
import * as supabaseService from "./supabase-service"
import * as moralisService from "./moralis-service"

// Service status
export async function getServiceStatus() {
  const supabaseStatus = await isSupabaseAvailable().catch(() => false)
  const moralisStatus = await isMoralisAvailable().catch(() => false)

  return {
    supabase: supabaseStatus,
    moralis: moralisStatus,
    usingLocalStorage: !supabaseStatus,
  }
}

// User operations
export async function getUserByWallet(walletAddress: string) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.getUserByWallet(walletAddress)
    }
    return null
  } catch (error) {
    console.error("Failed to get user:", error)
    return null
  }
}

export async function createUser(userData: any) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.createUser(userData)
    }
    throw new Error("Supabase not available")
  } catch (error) {
    console.error("Failed to create user:", error)
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
    throw error
  }
}

<<<<<<< HEAD
export async function getServiceStatus() {
  try {
    const moralisAvailable = !!(getMoralisApiKey() && isMoralisInitialized())
    const supabaseAvailable = isSupabaseConfigured()

    let supabaseConnected = false
    if (supabaseAvailable) {
      try {
        const supabase = createSupabaseClient()
        const { error } = await supabase.from("health_check").select("*").limit(1)
        supabaseConnected = !error
      } catch (error) {
        console.warn("Supabase connection test failed:", error)
      }
    }

    const usingLocalStorage = !supabaseConnected

    return {
      moralis: moralisAvailable,
      supabase: supabaseConnected,
      usingLocalStorage,
      config: {
        moralisApiKey: !!getMoralisApiKey(),
        supabaseUrl: !!getSupabaseConfig().url,
        frontendUrl: !!FRONTEND_URL,
        multiplayerUrl: !!MULTIPLAYER_SERVER_URL,
      },
    }
  } catch (error) {
    console.error("Failed to check service status:", error)
    return {
      moralis: false,
      supabase: false,
      usingLocalStorage: true,
      config: {
        moralisApiKey: false,
        supabaseUrl: false,
        frontendUrl: false,
        multiplayerUrl: false,
      },
    }
  }
}

// Player management functions
export async function savePlayer(player: Player): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      await supabaseService.savePlayer(player)
    } else {
      // Fallback to localStorage
      localStorage.setItem(`player_${player.walletAddress}`, JSON.stringify(player))
    }
  } catch (error) {
    console.error("Failed to save player:", error)
    // Fallback to localStorage
    localStorage.setItem(`player_${player.walletAddress}`, JSON.stringify(player))
  }
}

export async function getPlayer(walletAddress: string): Promise<Player | null> {
  try {
    if (isSupabaseConfigured()) {
      return await supabaseService.getPlayer(walletAddress)
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem(`player_${walletAddress}`)
      return stored ? JSON.parse(stored) : null
    }
  } catch (error) {
    console.error("Failed to get player:", error)
    // Fallback to localStorage
    const stored = localStorage.getItem(`player_${walletAddress}`)
    return stored ? JSON.parse(stored) : null
  }
}

export async function getLeaderboard(type = "total_resources", limit = 10): Promise<LeaderboardEntry[]> {
  try {
    if (isSupabaseConfigured()) {
      return await supabaseService.getLeaderboard(type, limit)
    } else {
      // Return empty leaderboard for localStorage mode
      return []
    }
  } catch (error) {
    console.error("Failed to get leaderboard:", error)
=======
export async function updateUser(walletAddress: string, updateData: any) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.updateUser(walletAddress, updateData)
    }
    throw new Error("Supabase not available")
  } catch (error) {
    console.error("Failed to update user:", error)
    throw error
  }
}

// Player progress operations
export async function getPlayerProgress(walletAddress: string) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.getPlayerProgress(walletAddress)
    }
    return null
  } catch (error) {
    console.error("Failed to get player progress:", error)
    return null
  }
}

export async function createPlayerProgress(walletAddress: string, initialData: any = {}) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.createPlayerProgress(walletAddress, initialData)
    }
    throw new Error("Supabase not available")
  } catch (error) {
    console.error("Failed to create player progress:", error)
    throw error
  }
}

export async function updatePlayerProgress(walletAddress: string, updateData: any) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.updatePlayerProgress(walletAddress, updateData)
    }
    throw new Error("Supabase not available")
  } catch (error) {
    console.error("Failed to update player progress:", error)
    throw error
  }
}

// Game session operations
export async function createGameSession(sessionData: any) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.createGameSession(sessionData)
    }
    throw new Error("Supabase not available")
  } catch (error) {
    console.error("Failed to create game session:", error)
    throw error
  }
}

export async function getActiveGameSessions() {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.getActiveGameSessions()
    }
    return []
  } catch (error) {
    console.error("Failed to get active game sessions:", error)
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
    return []
  }
}

<<<<<<< HEAD
export async function createGameSession(walletAddress: string): Promise<string> {
  try {
    if (isSupabaseConfigured()) {
      return await supabaseService.createGameSession(walletAddress)
    } else {
      // Generate local session ID
      return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  } catch (error) {
    console.error("Failed to create game session:", error)
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export async function endGameSession(sessionId: string, stats: any): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      await supabaseService.endGameSession(sessionId, stats)
    }
    // For localStorage mode, we don't persist session data
  } catch (error) {
    console.error("Failed to end game session:", error)
=======
// Leaderboard operations
export async function getLeaderboard(category: string, period: string) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.getLeaderboard(category, period)
    }
    return null
  } catch (error) {
    console.error("Failed to get leaderboard:", error)
    return null
  }
}

export async function updateLeaderboard(category: string, period: string, rankings: any[]) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.updateLeaderboard(category, period, rankings)
    }
    throw new Error("Supabase not available")
  } catch (error) {
    console.error("Failed to update leaderboard:", error)
    throw error
  }
}

// Game events logging
export async function logGameEvent(eventData: any) {
  try {
    const supabaseAvailable = await isSupabaseAvailable()
    if (supabaseAvailable) {
      return await supabaseService.logGameEvent(eventData)
    }
    return null
  } catch (error) {
    console.error("Failed to log game event:", error)
    return null
  }
}

// Web3 specific operations (using Moralis)
export async function getWalletNFTs(walletAddress: string, chain = "eth") {
  try {
    const moralisAvailable = await isMoralisAvailable()
    if (moralisAvailable) {
      return await moralisService.getWalletNFTs(walletAddress, chain)
    }
    return []
  } catch (error) {
    console.error("Failed to get wallet NFTs:", error)
    return []
  }
}

export async function getWalletTokens(walletAddress: string, chain = "eth") {
  try {
    const moralisAvailable = await isMoralisAvailable()
    if (moralisAvailable) {
      return await moralisService.getWalletTokens(walletAddress, chain)
    }
    return []
  } catch (error) {
    console.error("Failed to get wallet tokens:", error)
    return []
  }
}

// Stream real-time game events
export async function streamGameEvents(callback: (data: any) => void) {
  try {
    const moralisAvailable = await isMoralisAvailable()
    if (moralisAvailable) {
      return await moralisService.streamGameEvents(callback)
    }
    console.warn("Moralis not available for streaming events")
    return () => {}
  } catch (error) {
    console.error("Failed to stream game events:", error)
    return () => {}
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
  }
}
