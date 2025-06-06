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
    throw error
  }
}

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
    return []
  }
}

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
  }
}
