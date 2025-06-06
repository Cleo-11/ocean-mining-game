import { getSupabaseClient } from "./supabase-config"

// User operations
export async function getUserByWallet(walletAddress: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Failed to get user:", error)
    return null
  }
}

export async function createUser(userData: {
  walletAddress: string
  username: string
  preferences?: any
}) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          wallet_address: userData.walletAddress.toLowerCase(),
          username: userData.username,
          preferences: userData.preferences || {
            soundEnabled: true,
            musicVolume: 0.7,
            sfxVolume: 0.8,
            graphics: "medium",
            autoSave: true,
          },
          is_active: true,
          last_login: new Date(),
          created_at: new Date(),
        },
      ])
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Failed to create user:", error)
    throw error
  }
}

export async function updateUser(walletAddress: string, updateData: any) {
  try {
    const supabase = getSupabaseClient()

    // Convert camelCase to snake_case for database
    const dbData: any = {}
    Object.keys(updateData).forEach((key) => {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
      dbData[snakeKey] = updateData[key]
    })

    // Always update last_login
    dbData.last_login = new Date()

    const { data, error } = await supabase
      .from("users")
      .update(dbData)
      .eq("wallet_address", walletAddress.toLowerCase())
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Failed to update user:", error)
    throw error
  }
}

// Player progress operations
export async function getPlayerProgress(walletAddress: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("player_progress")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single()

    if (error) throw error

    // Convert snake_case to camelCase for frontend
    return snakeToCamel(data)
  } catch (error) {
    console.error("Failed to get player progress:", error)
    return null
  }
}

export async function createPlayerProgress(walletAddress: string, initialData: any = {}) {
  try {
    const supabase = getSupabaseClient()

    // Default initial player data
    const defaultData = {
      current_tier: 1,
      selected_submarine: 1,
      purchased_submarines: [1],
      resources: {
        nickel: 150,
        cobalt: 75,
        copper: 75,
        manganese: 40,
      },
      balance: 500,
      player_stats: {
        health: 100,
        energy: 100,
        capacity: {
          nickel: 0,
          cobalt: 0,
          copper: 0,
          manganese: 0,
        },
        max_capacity: {
          nickel: 100,
          cobalt: 50,
          copper: 50,
          manganese: 25,
        },
        depth: 1000,
        speed: 1,
        mining_rate: 1,
        tier: 1,
      },
      position: {
        x: 500,
        y: 500,
        rotation: 0,
      },
      total_resources_mined: 0,
      total_tokens_earned: 0,
      games_played: 0,
      total_play_time: 0,
      achievements: [],
      upgrade_history: [],
      version: "1.0",
      last_saved: new Date(),
    }

    // Convert initialData from camelCase to snake_case
    const snakeInitialData = camelToSnake(initialData)

    const playerData = {
      wallet_address: walletAddress.toLowerCase(),
      ...defaultData,
      ...snakeInitialData,
    }

    const { data, error } = await supabase.from("player_progress").insert([playerData]).select()

    if (error) throw error

    // Convert snake_case to camelCase for frontend
    return {
      result: data[0],
      playerData: snakeToCamel(data[0]),
    }
  } catch (error) {
    console.error("Failed to create player progress:", error)
    throw error
  }
}

export async function updatePlayerProgress(walletAddress: string, updateData: any) {
  try {
    const supabase = getSupabaseClient()

    // Convert camelCase to snake_case for database
    const dbData = camelToSnake(updateData)

    // Add lastSaved timestamp
    dbData.last_saved = new Date()

    const { data, error } = await supabase
      .from("player_progress")
      .update(dbData)
      .eq("wallet_address", walletAddress.toLowerCase())
      .select()

    if (error) throw error

    // Convert snake_case to camelCase for frontend
    return snakeToCamel(data[0])
  } catch (error) {
    console.error("Failed to update player progress:", error)
    throw error
  }
}

// Game session operations
export async function createGameSession(sessionData: any) {
  try {
    const supabase = getSupabaseClient()

    // Convert camelCase to snake_case
    const dbData = camelToSnake(sessionData)
    dbData.created_at = new Date()
    dbData.is_active = true

    const { data, error } = await supabase.from("game_sessions").insert([dbData]).select()

    if (error) throw error
    return snakeToCamel(data[0])
  } catch (error) {
    console.error("Failed to create game session:", error)
    throw error
  }
}

export async function getActiveGameSessions() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("game_sessions").select("*").eq("is_active", true).limit(100)

    if (error) throw error
    return data.map((session) => snakeToCamel(session))
  } catch (error) {
    console.error("Failed to get active game sessions:", error)
    return []
  }
}

// Leaderboard operations
export async function getLeaderboard(category: string, period: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("leaderboards")
      .select("*")
      .eq("category", category)
      .eq("period", period)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // Record not found
        return null
      }
      throw error
    }

    return snakeToCamel(data)
  } catch (error) {
    console.error("Failed to get leaderboard:", error)
    return null
  }
}

export async function updateLeaderboard(category: string, period: string, rankings: any[]) {
  try {
    const supabase = getSupabaseClient()

    // Check if leaderboard exists
    const { data: existingData } = await supabase
      .from("leaderboards")
      .select("id")
      .eq("category", category)
      .eq("period", period)
      .single()

    if (existingData) {
      // Update existing leaderboard
      const { data, error } = await supabase
        .from("leaderboards")
        .update({
          rankings: rankings,
          last_updated: new Date(),
        })
        .eq("id", existingData.id)
        .select()

      if (error) throw error
      return snakeToCamel(data[0])
    } else {
      // Create new leaderboard
      const { data, error } = await supabase
        .from("leaderboards")
        .insert([
          {
            category,
            period,
            rankings,
            last_updated: new Date(),
          },
        ])
        .select()

      if (error) throw error
      return snakeToCamel(data[0])
    }
  } catch (error) {
    console.error("Failed to update leaderboard:", error)
    throw error
  }
}

// Game events logging
export async function logGameEvent(eventData: any) {
  try {
    const supabase = getSupabaseClient()

    // Convert camelCase to snake_case
    const dbData = camelToSnake(eventData)
    dbData.timestamp = new Date()

    const { data, error } = await supabase.from("game_events").insert([dbData]).select()

    if (error) throw error
    return snakeToCamel(data[0])
  } catch (error) {
    console.error("Failed to log game event:", error)
    // Don't throw for logging errors
    return null
  }
}

// Helper functions for case conversion
function camelToSnake(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item))
  }

  const result: any = {}
  Object.keys(obj).forEach((key) => {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
    result[snakeKey] = camelToSnake(obj[key])
  })

  return result
}

function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item))
  }

  const result: any = {}
  Object.keys(obj).forEach((key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = snakeToCamel(obj[key])
  })

  return result
}
