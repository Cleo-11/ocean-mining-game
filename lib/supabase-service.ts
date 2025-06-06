import { createSupabaseClient, createSupabaseServiceClient, isSupabaseConfigured } from "./supabase-config"
import type { Player, LeaderboardEntry } from "./types"

export async function savePlayer(player: Player): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }

  const supabase = createSupabaseServiceClient()

  // First, ensure user exists
  const { error: userError } = await supabase.from("users").upsert({
    wallet_address: player.walletAddress,
    username: player.username || `Player_${player.walletAddress.slice(-6)}`,
    last_login: new Date().toISOString(),
  })

  if (userError) {
    console.error("Failed to upsert user:", userError)
  }

  // Then save player progress
  const { error: progressError } = await supabase.from("player_progress").upsert({
    wallet_address: player.walletAddress,
    current_tier: player.currentTier,
    selected_submarine: player.selectedSubmarine,
    purchased_submarines: player.purchasedSubmarines,
    resources: player.resources,
    balance: player.balance,
    player_stats: player.playerStats,
    position: player.position,
    total_resources_mined: player.totalResourcesMined,
    total_tokens_earned: player.totalTokensEarned,
    games_played: player.gamesPlayed,
    total_play_time: player.totalPlayTime,
    achievements: player.achievements,
    upgrade_history: player.upgradeHistory,
    last_saved: new Date().toISOString(),
  })

  if (progressError) {
    throw new Error(`Failed to save player progress: ${progressError.message}`)
  }
}

export async function getPlayer(walletAddress: string): Promise<Player | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from("player_progress")
    .select(`
      *,
      users!inner(username, wallet_address)
    `)
    .eq("wallet_address", walletAddress)
    .single()

  if (error || !data) {
    return null
  }

  return {
    walletAddress: data.wallet_address,
    username: data.users.username,
    currentTier: data.current_tier,
    selectedSubmarine: data.selected_submarine,
    purchasedSubmarines: data.purchased_submarines,
    resources: data.resources,
    balance: data.balance,
    playerStats: data.player_stats,
    position: data.position,
    totalResourcesMined: data.total_resources_mined,
    totalTokensEarned: data.total_tokens_earned,
    gamesPlayed: data.games_played,
    totalPlayTime: data.total_play_time,
    achievements: data.achievements,
    upgradeHistory: data.upgrade_history,
  }
}

export async function getLeaderboard(type = "total_resources", limit = 10): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from("player_progress")
    .select(`
      wallet_address,
      total_resources_mined,
      total_tokens_earned,
      users!inner(username)
    `)
    .order("total_resources_mined", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data.map((entry, index) => ({
    rank: index + 1,
    walletAddress: entry.wallet_address,
    username: entry.users.username,
    score: entry.total_resources_mined,
    totalTokensEarned: entry.total_tokens_earned,
  }))
}

export async function createGameSession(walletAddress: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }

  const supabase = createSupabaseServiceClient()
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const { error } = await supabase.from("game_sessions").insert({
    session_id: sessionId,
    wallet_address: walletAddress,
    started_at: new Date().toISOString(),
    is_active: true,
  })

  if (error) {
    throw new Error(`Failed to create game session: ${error.message}`)
  }

  return sessionId
}

export async function endGameSession(sessionId: string, stats: any): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }

  const supabase = createSupabaseServiceClient()

  const { error } = await supabase
    .from("game_sessions")
    .update({
      ended_at: new Date().toISOString(),
      is_active: false,
      session_stats: stats,
    })
    .eq("session_id", sessionId)

  if (error) {
    console.error("Failed to end game session:", error)
  }
}

export async function getActiveGameSessions() {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createSupabaseClient()

  const { data, error } = await supabase.from("game_sessions").select("*").eq("is_active", true)

  if (error) {
    console.error("Failed to get active sessions:", error)
    return []
  }

  return data || []
}

export async function createUser(userData: any) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }

  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from("users")
    .insert({
      wallet_address: userData.walletAddress,
      username: userData.username,
      preferences: userData.preferences || {},
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return data
}

export async function updateUser(walletAddress: string, updateData: any) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }

  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from("users")
    .update({
      ...updateData,
      last_login: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress)
    .select()

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`)
  }

  return data
}

export async function createPlayerProgress(walletAddress: string, initialData: any = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }

  const supabase = createSupabaseServiceClient()

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
      capacity: { nickel: 0, cobalt: 0, copper: 0, manganese: 0 },
      maxCapacity: { nickel: 100, cobalt: 50, copper: 50, manganese: 25 },
      depth: 1000,
      speed: 1,
      miningRate: 1,
      tier: 1,
    },
    position: { x: 500, y: 500, rotation: 0 },
    total_resources_mined: 0,
    total_tokens_earned: 0,
    games_played: 0,
    total_play_time: 0,
    achievements: [],
    upgrade_history: [],
  }

  const playerData = {
    wallet_address: walletAddress,
    ...defaultData,
    ...initialData,
    last_saved: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("player_progress").insert(playerData).select().single()

  if (error) {
    throw new Error(`Failed to create player progress: ${error.message}`)
  }

  return { result: data, playerData }
}

export async function updateLeaderboard(category: string, period: string, rankings: any[]) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured")
  }

  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from("leaderboards")
    .upsert({
      category,
      period,
      rankings,
      last_updated: new Date().toISOString(),
    })
    .select()

  if (error) {
    throw new Error(`Failed to update leaderboard: ${error.message}`)
  }

  return data
}

export async function logGameEvent(eventData: any) {
  if (!isSupabaseConfigured()) {
    return null
  }

  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from("game_events")
    .insert({
      ...eventData,
      timestamp: new Date().toISOString(),
    })
    .select()

  if (error) {
    console.error("Failed to log game event:", error)
    return null
  }

  return data
}
