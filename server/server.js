const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const { ethers } = require("ethers")
const { createClient } = require("@supabase/supabase-js")
require("dotenv").config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Smart Contract Configuration
const CONTRACTS = {
  OceanXToken: {
    address: "0x7082bd37ea9552faf0549abb868602135aada705",
    abi: [
      "function balanceOf(address owner) view returns (uint256)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      "function mint(address to, uint256 amount)",
      "function decimals() view returns (uint8)",
    ],
  },
  PlayerProfile: {
    address: "0x3b4682e9e31c0fb9391967ce51c58e8b4cc02063",
    abi: [
      "function createProfile(address player)",
      "function updateSubmarine(address player, uint8 submarineType)",
      "function getPlayerProfile(address player) view returns (uint8 submarineType, uint256 level)",
      "function playerExists(address player) view returns (bool)",
    ],
  },
  UpgradeManager: {
    address: "0xb8ca16e41aac1e17dc5ddd22c5f20b35860f9a0c",
    abi: [
      "function upgradeSubmarine(address player)",
      "function getUpgradeCost(uint8 currentTier) view returns (uint256)",
      "function canUpgrade(address player) view returns (bool)",
    ],
  },
  DailyMiner: {
    address: "0x8b0f0580fe26554bbfa2668ee042f20301c3ced3",
    abi: [
      "function claimDailyReward(address player)",
      "function getLastClaimTime(address player) view returns (uint256)",
      "function getDailyReward() view returns (uint256)",
    ],
  },
}

// Initialize provider and contracts
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://mainnet.infura.io/v3/your-key")
const contracts = {}

Object.keys(CONTRACTS).forEach((name) => {
  contracts[name] = new ethers.Contract(CONTRACTS[name].address, CONTRACTS[name].abi, provider)
})

// Game Sessions Management
const gameSessions = new Map()
const MAX_PLAYERS_PER_SESSION = 20

class GameSession {
  constructor(id) {
    this.id = id
    this.players = new Map()
    this.createdAt = Date.now()
    this.maxPlayers = MAX_PLAYERS_PER_SESSION
  }

  addPlayer(socketId, playerData) {
    if (this.players.size >= this.maxPlayers) {
      return false
    }
    this.players.set(socketId, playerData)
    return true
  }

  removePlayer(socketId) {
    this.players.delete(socketId)
  }

  isFull() {
    return this.players.size >= this.maxPlayers
  }

  isEmpty() {
    return this.players.size === 0
  }

  getPlayerCount() {
    return this.players.size
  }

  getPlayersData() {
    return Array.from(this.players.values())
  }
}

// Find or create available session
function findAvailableSession() {
  // Find existing session with space
  for (const [sessionId, session] of gameSessions) {
    if (!session.isFull()) {
      return session
    }
  }

  // Create new session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const newSession = new GameSession(sessionId)
  gameSessions.set(sessionId, newSession)
  console.log(`🎮 Created new game session: ${sessionId}`)
  return newSession
}

// Wallet signature verification
function verifySignature(message, signature, address) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch (error) {
    console.error("Signature verification failed:", error)
    return false
  }
}

// API Routes

// Wallet Authentication
app.post("/auth/connect", async (req, res) => {
  try {
    const { address, signature, message } = req.body

    if (!address || !signature || !message) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Verify signature
    const isValid = verifySignature(message, signature, address)
    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" })
    }

    // Check if player profile exists
    const playerExists = await contracts.PlayerProfile.playerExists(address)

    if (!playerExists) {
      // Create new player profile (this would need admin wallet in production)
      console.log(`Creating new player profile for ${address}`)
    }

    // Store session in Supabase
    const { data, error } = await supabase.from("player_sessions").upsert({
      wallet_address: address.toLowerCase(),
      last_login: new Date().toISOString(),
      is_active: true,
    })

    if (error) {
      console.error("Supabase error:", error)
    }

    res.json({
      success: true,
      address: address.toLowerCase(),
      sessionToken: ethers.id(`${address}_${Date.now()}`),
    })
  } catch (error) {
    console.error("Auth error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
})

// Join Game Session
app.post("/game/join", async (req, res) => {
  try {
    const { address, sessionToken } = req.body

    if (!address || !sessionToken) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Find available session
    const session = findAvailableSession()

    // Get player submarine info
    const [submarineType, level] = await contracts.PlayerProfile.getPlayerProfile(address)

    const playerData = {
      address: address.toLowerCase(),
      submarineType: Number(submarineType),
      level: Number(level),
      joinedAt: Date.now(),
    }

    res.json({
      success: true,
      sessionId: session.id,
      playerCount: session.getPlayerCount(),
      maxPlayers: session.maxPlayers,
      playerData,
    })
  } catch (error) {
    console.error("Join game error:", error)
    res.status(500).json({ error: "Failed to join game" })
  }
})

// Get Submarine Tiers
app.get("/submarines", (req, res) => {
  const submarineTiers = [
    {
      id: 1,
      name: "Basic Submarine",
      cost: 0,
      stats: { health: 100, energy: 100, capacity: 100, speed: 1.0, miningRate: 1.0 },
    },
    {
      id: 2,
      name: "Enhanced Submarine",
      cost: 100,
      stats: { health: 125, energy: 120, capacity: 150, speed: 1.1, miningRate: 1.2 },
    },
    {
      id: 3,
      name: "Deep-Sea Submarine",
      cost: 250,
      stats: { health: 150, energy: 140, capacity: 200, speed: 1.2, miningRate: 1.4 },
    },
    {
      id: 4,
      name: "Heavy-Duty Submarine",
      cost: 500,
      stats: { health: 200, energy: 180, capacity: 300, speed: 1.3, miningRate: 1.6 },
    },
    {
      id: 5,
      name: "Thermal Submarine",
      cost: 1000,
      stats: { health: 250, energy: 220, capacity: 400, speed: 1.4, miningRate: 1.8 },
    },
    {
      id: 6,
      name: "Pressure Submarine",
      cost: 2000,
      stats: { health: 300, energy: 260, capacity: 500, speed: 1.5, miningRate: 2.0 },
    },
    {
      id: 7,
      name: "Kraken Submarine",
      cost: 4000,
      stats: { health: 400, energy: 320, capacity: 650, speed: 1.6, miningRate: 2.2 },
    },
    {
      id: 8,
      name: "Cosmic Submarine",
      cost: 8000,
      stats: { health: 500, energy: 400, capacity: 800, speed: 1.8, miningRate: 2.5 },
    },
    {
      id: 9,
      name: "Omega Submarine",
      cost: 15000,
      stats: { health: 750, energy: 500, capacity: 1000, speed: 2.0, miningRate: 3.0 },
    },
    {
      id: 10,
      name: "Leviathan Submarine",
      cost: 30000,
      stats: { health: 1000, energy: 750, capacity: 1500, speed: 2.5, miningRate: 4.0 },
    },
  ]

  res.json({ submarines: submarineTiers })
})

// Get Player Submarine Info
app.get("/player/submarine/:address", async (req, res) => {
  try {
    const { address } = req.params

    const [submarineType, level] = await contracts.PlayerProfile.getPlayerProfile(address)
    const upgradeCost = await contracts.UpgradeManager.getUpgradeCost(submarineType)
    const canUpgrade = await contracts.UpgradeManager.canUpgrade(address)

    res.json({
      currentSubmarine: Number(submarineType),
      level: Number(level),
      upgradeCost: ethers.formatEther(upgradeCost),
      canUpgrade,
    })
  } catch (error) {
    console.error("Get submarine error:", error)
    res.status(500).json({ error: "Failed to get submarine info" })
  }
})

// Get Player OCX Balance
app.get("/player/balance/:address", async (req, res) => {
  try {
    const { address } = req.params

    const balance = await contracts.OceanXToken.balanceOf(address)
    const decimals = await contracts.OceanXToken.decimals()

    res.json({
      balance: ethers.formatUnits(balance, decimals),
      balanceWei: balance.toString(),
    })
  } catch (error) {
    console.error("Get balance error:", error)
    res.status(500).json({ error: "Failed to get balance" })
  }
})

// Claim Daily Rewards
app.post("/rewards/claim", async (req, res) => {
  try {
    const { address } = req.body

    const lastClaimTime = await contracts.DailyMiner.getLastClaimTime(address)
    const dailyReward = await contracts.DailyMiner.getDailyReward()

    const now = Math.floor(Date.now() / 1000)
    const canClaim = now - Number(lastClaimTime) >= 86400 // 24 hours

    if (!canClaim) {
      const timeUntilNextClaim = 86400 - (now - Number(lastClaimTime))
      return res.json({
        success: false,
        message: "Daily reward already claimed",
        timeUntilNextClaim,
      })
    }

    res.json({
      success: true,
      canClaim: true,
      rewardAmount: ethers.formatEther(dailyReward),
      message: "Ready to claim daily reward",
    })
  } catch (error) {
    console.error("Claim rewards error:", error)
    res.status(500).json({ error: "Failed to check daily rewards" })
  }
})

// WebSocket Connection Handling
io.on("connection", (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`)

  socket.on("join-session", async (data) => {
    try {
      const { sessionId, playerData } = data

      let session = gameSessions.get(sessionId)
      if (!session) {
        session = findAvailableSession()
      }

      const added = session.addPlayer(socket.id, playerData)
      if (!added) {
        socket.emit("session-full")
        return
      }

      socket.join(session.id)
      socket.sessionId = session.id

      // Notify all players in session
      io.to(session.id).emit("player-joined", {
        playerId: socket.id,
        playerData,
        totalPlayers: session.getPlayerCount(),
        players: session.getPlayersData(),
      })

      console.log(
        `🎮 Player ${playerData.address} joined session ${session.id} (${session.getPlayerCount()}/${session.maxPlayers})`,
      )
    } catch (error) {
      console.error("Join session error:", error)
      socket.emit("error", { message: "Failed to join session" })
    }
  })

  socket.on("player-move", (data) => {
    if (socket.sessionId) {
      socket.to(socket.sessionId).emit("player-moved", {
        playerId: socket.id,
        ...data,
      })
    }
  })

  socket.on("player-mine", (data) => {
    if (socket.sessionId) {
      socket.to(socket.sessionId).emit("player-mined", {
        playerId: socket.id,
        ...data,
      })
    }
  })

  socket.on("disconnect", () => {
    console.log(`🔌 Player disconnected: ${socket.id}`)

    if (socket.sessionId) {
      const session = gameSessions.get(socket.sessionId)
      if (session) {
        session.removePlayer(socket.id)

        // Notify remaining players
        io.to(socket.sessionId).emit("player-left", {
          playerId: socket.id,
          totalPlayers: session.getPlayerCount(),
        })

        // Clean up empty sessions
        if (session.isEmpty()) {
          gameSessions.delete(socket.sessionId)
          console.log(`🗑️ Cleaned up empty session: ${socket.sessionId}`)
        }
      }
    }
  })
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    activeSessions: gameSessions.size,
    totalPlayers: Array.from(gameSessions.values()).reduce((sum, session) => sum + session.getPlayerCount(), 0),
    uptime: process.uptime(),
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 Ocean Mining Server running on port ${PORT}`)
  console.log(`🌊 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
})
