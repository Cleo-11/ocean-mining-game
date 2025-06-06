import Moralis from "moralis"
import { initializeMoralis } from "./moralis-config"

// Ensure Moralis is initialized before any operations
async function ensureMoralisInitialized() {
  if (!Moralis.Core.isStarted) {
    await initializeMoralis()
  }
}

// Verify wallet signature
export async function verifyWalletSignature(message: string, signature: string, address: string) {
  try {
    await ensureMoralisInitialized()

    const result = await Moralis.Auth.verify({
      message,
      signature,
      networkType: "evm",
    })

    return result.address.toLowerCase() === address.toLowerCase()
  } catch (error) {
    console.error("Failed to verify signature with Moralis:", error)
    return false
  }
}

// Get wallet NFTs
export async function getWalletNFTs(walletAddress: string, chain = "eth") {
  try {
    await ensureMoralisInitialized()

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: walletAddress,
      chain: chain as any,
    })

    return response.result
  } catch (error) {
    console.error("Failed to get wallet NFTs:", error)
    return []
  }
}

// Get wallet tokens
export async function getWalletTokens(walletAddress: string, chain = "eth") {
  try {
    await ensureMoralisInitialized()

    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      address: walletAddress,
      chain: chain as any,
    })

    return response.result
  } catch (error) {
    console.error("Failed to get wallet tokens:", error)
    return []
  }
}

// Stream real-time game events
export async function streamGameEvents(callback: (data: any) => void) {
  try {
    await ensureMoralisInitialized()

    // This is a simplified example - in a real app, you'd use Moralis Streams API
    // to subscribe to blockchain events or use Moralis' real-time database features
    console.log("Setting up Moralis stream for game events")

    // Return a function to unsubscribe
    return () => {
      console.log("Unsubscribing from Moralis game events stream")
    }
  } catch (error) {
    console.error("Failed to stream game events:", error)
    throw error
  }
}

// User operations
export async function getUserByWallet(walletAddress: string) {
  try {
    await ensureMoralisInitialized()

    const query = new Moralis.Query("Users")
    query.equalTo("walletAddress", walletAddress.toLowerCase())

    const user = await query.first()
    return user ? user.toJSON() : null
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
    await ensureMoralisInitialized()

    const User = Moralis.Object.extend("Users")
    const user = new User()

    user.set("walletAddress", userData.walletAddress.toLowerCase())
    user.set("username", userData.username)
    user.set(
      "preferences",
      userData.preferences || {
        soundEnabled: true,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        graphics: "medium",
        autoSave: true,
      },
    )
    user.set("isActive", true)
    user.set("lastLogin", new Date())

    const result = await user.save()
    return result.toJSON()
  } catch (error) {
    console.error("Failed to create user:", error)
    throw error
  }
}

export async function updateUser(walletAddress: string, updateData: any) {
  try {
    await ensureMoralisInitialized()

    const query = new Moralis.Query("Users")
    query.equalTo("walletAddress", walletAddress.toLowerCase())

    const user = await query.first()
    if (!user) {
      throw new Error("User not found")
    }

    Object.keys(updateData).forEach((key) => {
      user.set(key, updateData[key])
    })
    user.set("lastLogin", new Date())

    const result = await user.save()
    return result.toJSON()
  } catch (error) {
    console.error("Failed to update user:", error)
    throw error
  }
}

// Player progress operations
export async function getPlayerProgress(walletAddress: string) {
  try {
    await ensureMoralisInitialized()

    const query = new Moralis.Query("PlayerProgress")
    query.equalTo("walletAddress", walletAddress.toLowerCase())

    const progress = await query.first()
    return progress ? progress.toJSON() : null
  } catch (error) {
    console.error("Failed to get player progress:", error)
    return null
  }
}

export async function createPlayerProgress(walletAddress: string, initialData: any = {}) {
  try {
    await ensureMoralisInitialized()

    const PlayerProgress = Moralis.Object.extend("PlayerProgress")
    const progress = new PlayerProgress()

    // Default initial player data
    const defaultData = {
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
        capacity: {
          nickel: 0,
          cobalt: 0,
          copper: 0,
          manganese: 0,
        },
        maxCapacity: {
          nickel: 100,
          cobalt: 50,
          copper: 50,
          manganese: 25,
        },
        depth: 1000,
        speed: 1,
        miningRate: 1,
        tier: 1,
      },
      position: {
        x: 500,
        y: 500,
        rotation: 0,
      },
      totalResourcesMined: 0,
      totalTokensEarned: 0,
      gamesPlayed: 0,
      totalPlayTime: 0,
      achievements: [],
      upgradeHistory: [],
      version: "1.0",
    }

    const playerData = {
      walletAddress: walletAddress.toLowerCase(),
      ...defaultData,
      ...initialData,
    }

    Object.keys(playerData).forEach((key) => {
      progress.set(key, playerData[key])
    })

    const result = await progress.save()
    return { result: result.toJSON(), playerData }
  } catch (error) {
    console.error("Failed to create player progress:", error)
    throw error
  }
}

export async function updatePlayerProgress(walletAddress: string, updateData: any) {
  try {
    await ensureMoralisInitialized()

    const query = new Moralis.Query("PlayerProgress")
    query.equalTo("walletAddress", walletAddress.toLowerCase())

    const progress = await query.first()
    if (!progress) {
      throw new Error("Player progress not found")
    }

    Object.keys(updateData).forEach((key) => {
      progress.set(key, updateData[key])
    })
    progress.set("lastSaved", new Date())

    const result = await progress.save()
    return result.toJSON()
  } catch (error) {
    console.error("Failed to update player progress:", error)
    throw error
  }
}

// Game session operations
export async function createGameSession(sessionData: any) {
  try {
    await ensureMoralisInitialized()

    const GameSession = Moralis.Object.extend("GameSessions")
    const session = new GameSession()

    Object.keys(sessionData).forEach((key) => {
      session.set(key, sessionData[key])
    })
    session.set("isActive", true)

    const result = await session.save()
    return result.toJSON()
  } catch (error) {
    console.error("Failed to create game session:", error)
    throw error
  }
}

export async function getActiveGameSessions() {
  try {
    await ensureMoralisInitialized()

    const query = new Moralis.Query("GameSessions")
    query.equalTo("isActive", true)
    query.limit(100)

    const sessions = await query.find()
    return sessions.map((session) => session.toJSON())
  } catch (error) {
    console.error("Failed to get active game sessions:", error)
    return []
  }
}

// Leaderboard operations
export async function getLeaderboard(category: string, period: string) {
  try {
    await ensureMoralisInitialized()

    const query = new Moralis.Query("Leaderboards")
    query.equalTo("category", category)
    query.equalTo("period", period)

    const leaderboard = await query.first()
    return leaderboard ? leaderboard.toJSON() : null
  } catch (error) {
    console.error("Failed to get leaderboard:", error)
    return null
  }
}

export async function updateLeaderboard(category: string, period: string, rankings: any[]) {
  try {
    await ensureMoralisInitialized()

    const query = new Moralis.Query("Leaderboards")
    query.equalTo("category", category)
    query.equalTo("period", period)

    let leaderboard = await query.first()

    if (!leaderboard) {
      const Leaderboard = Moralis.Object.extend("Leaderboards")
      leaderboard = new Leaderboard()
      leaderboard.set("category", category)
      leaderboard.set("period", period)
    }

    leaderboard.set("rankings", rankings)
    leaderboard.set("lastUpdated", new Date())

    const result = await leaderboard.save()
    return result.toJSON()
  } catch (error) {
    console.error("Failed to update leaderboard:", error)
    throw error
  }
}

// Game events logging
export async function logGameEvent(eventData: any) {
  try {
    await ensureMoralisInitialized()

    const GameEvent = Moralis.Object.extend("GameEvents")
    const event = new GameEvent()

    Object.keys(eventData).forEach((key) => {
      event.set(key, eventData[key])
    })
    event.set("timestamp", new Date())

    const result = await event.save()
    return result.toJSON()
  } catch (error) {
    console.error("Failed to log game event:", error)
    // Don't throw for logging errors
    return null
  }
}

// Check if Moralis is available
export async function isMoralisAvailable(): Promise<boolean> {
  try {
    await ensureMoralisInitialized()
    return true
  } catch (error) {
    console.error("Moralis not available:", error)
    return false
  }
}
