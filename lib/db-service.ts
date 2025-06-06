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
    throw error
  }
}

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
    return []
  }
}

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
  }
}
