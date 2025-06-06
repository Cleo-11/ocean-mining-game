// This file serves as a unified interface for database operations
// It will use Supabase for persistent storage and Moralis for Web3 functionality

import { initializeMoralis, isMoralisInitialized, isMoralisConfigured } from "./moralis-config"
import { createSupabaseClient, isSupabaseConfigured, getSupabaseConfig } from "./supabase-config"

// ✅ Capture env vars at build time
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL
const MULTIPLAYER_SERVER_URL = process.env.NEXT_PUBLIC_MULTIPLAYER_SERVER_URL

let servicesInitialized = false

export async function initializeServices() {
  if (servicesInitialized) return

  try {
    console.log("🚀 Initializing services...")

    // Initialize Moralis
    if (isMoralisConfigured()) {
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
    const moralisAvailable = isMoralisConfigured() && isMoralisInitialized()
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
        moralisApiKey: isMoralisConfigured(),
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

// Simple player data structure for localStorage fallback
interface PlayerData {
  walletAddress: string
  username?: string
  currentTier: number
  selectedSubmarine: number
  purchasedSubmarines: number[]
  resources: {
    nickel: number
    cobalt: number
    copper: number
    manganese: number
  }
  balance: number
  playerStats: any
  position: {
    x: number
    y: number
    rotation: number
  }
  lastSaved?: Date
}

// Player management functions
export async function savePlayer(player: PlayerData): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from("player_progress").upsert({
        wallet_address: player.walletAddress,
        current_tier: player.currentTier,
        selected_submarine: player.selectedSubmarine,
        purchased_submarines: player.purchasedSubmarines,
        resources: player.resources,
        balance: player.balance,
        player_stats: player.playerStats,
        position: player.position,
        last_saved: new Date().toISOString(),
      })

      if (error) throw error
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

export async function getPlayer(walletAddress: string): Promise<PlayerData | null> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("player_progress")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single()

      if (error) throw error

      if (data) {
        return {
          walletAddress: data.wallet_address,
          currentTier: data.current_tier,
          selectedSubmarine: data.selected_submarine,
          purchasedSubmarines: data.purchased_submarines,
          resources: data.resources,
          balance: data.balance,
          playerStats: data.player_stats,
          position: data.position,
          lastSaved: data.last_saved,
        }
      }
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

  return null
}

// Legacy functions for backward compatibility
export async function getUserByWallet(walletAddress: string) {
  return await getPlayer(walletAddress)
}

export async function getPlayerProgress(walletAddress: string) {
  return await getPlayer(walletAddress)
}

export async function updatePlayerProgress(walletAddress: string, updateData: any) {
  const player = await getPlayer(walletAddress)
  if (player) {
    const updatedPlayer = { ...player, ...updateData }
    await savePlayer(updatedPlayer)
    return updatedPlayer
  }
  throw new Error("Player not found")
}

export async function createUser(userData: any) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .insert({
        wallet_address: userData.walletAddress,
        username: userData.username,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
  throw new Error("Supabase not available")
}

export async function updateUser(walletAddress: string, updateData: any) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .update({
        username: updateData.username,
        last_login: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress)
      .select()
      .single()

    if (error) throw error
    return data
  }
  throw new Error("Supabase not available")
}

export async function createPlayerProgress(walletAddress: string, initialData: any = {}) {
  const defaultData = {
    walletAddress,
    currentTier: 1,
    selectedSubmarine: 1,
    purchasedSubmarines: [1],
    resources: {
      nickel: 150,
      cobalt: 75,
      copper: 75,
      manganese: 40,
    },
    balance: 500,
    playerStats: {
      health: 100,
      energy: 100,
      capacity: { nickel: 0, cobalt: 0, copper: 0, manganese: 0 },
      maxCapacity: { nickel: 100, cobalt: 50, copper: 50, manganese: 25 },
      depth: 1000,
      speed: 1,
      miningRate: 1,
      tier: 1,
    },
    position: { x: 500, y: 500, rotation: 0 },
    ...initialData,
  }

  await savePlayer(defaultData)
  return { result: { acknowledged: true }, playerData: defaultData }
}

// Stub functions for features not yet implemented
export async function getLeaderboard(type = "total_resources", limit = 10) {
  return []
}

export async function createGameSession(walletAddress: string) {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function endGameSession(sessionId: string, stats: any) {
  // Not implemented yet
}

export async function getActiveGameSessions() {
  return []
}

export async function updateLeaderboard(category: string, period: string, rankings: any[]) {
  // Not implemented yet
}

export async function logGameEvent(eventData: any) {
  // Not implemented yet
  return null
}
