const WebSocket = require("ws")
const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Root route - server info
app.get("/", (req, res) => {
  res.json({
    name: "Ocean Mining Multiplayer Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      stats: "/api/stats",
      players: "/api/players",
      websocket: "ws://[server-url]",
    },
    description: "WebSocket server for Ocean Mining multiplayer game",
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: gameState.players.size,
  })
})

// Game state
const gameState = {
  players: new Map(),
  resourceNodes: new Map(),
  gameStats: {
    totalPlayers: 0,
    activeConnections: 0,
    resourcesGenerated: 0,
    startTime: Date.now(),
  },
}

// Generate initial resource nodes
function generateResourceNode() {
  const types = ["nickel", "cobalt", "copper", "manganese"]
  const weights = { nickel: 0.4, cobalt: 0.3, copper: 0.25, manganese: 0.05 }

  const random = Math.random()
  let selectedType = "nickel"
  let cumulativeWeight = 0

  for (const [type, weight] of Object.entries(weights)) {
    cumulativeWeight += weight
    if (random <= cumulativeWeight) {
      selectedType = type
      break
    }
  }

  return {
    id: uuidv4(),
    position: {
      x: Math.random() * 1800 + 100,
      y: Math.random() * 1800 + 100,
    },
    type: selectedType,
    amount: Math.floor(Math.random() * 20) + 5,
    depleted: false,
    size: Math.random() * 10 + 20,
    spawnTime: Date.now(),
  }
}

// Initialize resource nodes
function initializeResourceNodes() {
  for (let i = 0; i < 50; i++) {
    const node = generateResourceNode()
    gameState.resourceNodes.set(node.id, node)
  }
  console.log(`🎮 Initialized ${gameState.resourceNodes.size} resource nodes`)
}

// Generate new resource nodes periodically
function startResourceGeneration() {
  setInterval(() => {
    // Clean up old depleted nodes
    const now = Date.now()
    for (const [id, node] of gameState.resourceNodes.entries()) {
      if (node.depleted && now - node.spawnTime > 120000) {
        // 2 minutes
        gameState.resourceNodes.delete(id)
      }
    }

    // Add new nodes if below threshold
    if (gameState.resourceNodes.size < 60) {
      const newNode = generateResourceNode()
      gameState.resourceNodes.set(newNode.id, newNode)
      gameState.gameStats.resourcesGenerated++

      // Broadcast new node to all players
      broadcastToAll({
        type: "resource_spawned",
        data: newNode,
      })
    }
  }, 3000) // Every 3 seconds
}

// Broadcast message to all connected players
function broadcastToAll(message, excludePlayerId = null) {
  for (const [playerId, player] of gameState.players.entries()) {
    if (playerId !== excludePlayerId && player.ws && player.ws.readyState === WebSocket.OPEN) {
      try {
        player.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Error sending message to player ${playerId}:`, error)
      }
    }
  }
}

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Ocean Mining Server running on port ${PORT}`)
  console.log(`📡 WebSocket server will be available at ws://localhost:${PORT}`)
  console.log(`🌐 HTTP API available at http://localhost:${PORT}`)
})

// Create WebSocket server
const wss = new WebSocket.Server({ server })

wss.on("connection", (ws, req) => {
  console.log("🔌 New WebSocket connection")

  let playerId = null

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message)

      switch (data.type) {
        case "player_join":
          playerId = data.data.playerId

          // Store player data
          gameState.players.set(playerId, {
            ...data.data,
            ws: ws,
            lastSeen: Date.now(),
            connectionTime: Date.now(),
          })

          gameState.gameStats.totalPlayers++
          gameState.gameStats.activeConnections = gameState.players.size

          console.log(`👤 Player joined: ${data.data.username} (${playerId})`)

          // Send current game state to new player
          ws.send(
            JSON.stringify({
              type: "game_state",
              data: {
                players: Array.from(gameState.players.entries())
                  .filter(([id]) => id !== playerId)
                  .map(([id, player]) => ({
                    playerId: id,
                    username: player.username,
                    position: player.position,
                    submarine: player.submarine,
                    walletAddress: player.walletAddress,
                  })),
                resourceNodes: Array.from(gameState.resourceNodes.values()),
                gameStats: gameState.gameStats,
              },
            }),
          )

          // Notify other players
          broadcastToAll(
            {
              type: "player_joined",
              data: {
                playerId: playerId,
                username: data.data.username,
                position: data.data.position,
                submarine: data.data.submarine,
                walletAddress: data.data.walletAddress,
              },
            },
            playerId,
          )

          break

        case "player_position":
          if (playerId && gameState.players.has(playerId)) {
            const player = gameState.players.get(playerId)
            player.position = data.data.position
            player.lastSeen = Date.now()

            // Broadcast position update to other players
            broadcastToAll(
              {
                type: "player_update",
                data: {
                  playerId: playerId,
                  position: data.data.position,
                  timestamp: data.data.timestamp,
                },
              },
              playerId,
            )
          }
          break

        case "player_submarine":
          if (playerId && gameState.players.has(playerId)) {
            const player = gameState.players.get(playerId)
            player.submarine = data.data.submarine
            player.lastSeen = Date.now()

            // Broadcast submarine update to other players
            broadcastToAll(
              {
                type: "player_submarine_update",
                data: {
                  playerId: playerId,
                  submarine: data.data.submarine,
                  timestamp: data.data.timestamp,
                },
              },
              playerId,
            )
          }
          break

        case "resource_mined":
          if (data.data.nodeId && gameState.resourceNodes.has(data.data.nodeId)) {
            const node = gameState.resourceNodes.get(data.data.nodeId)
            node.amount -= data.data.amount

            if (node.amount <= 0) {
              node.depleted = true
            }

            // Broadcast resource update to all players
            broadcastToAll({
              type: "resource_updated",
              data: {
                nodeId: data.data.nodeId,
                amount: node.amount,
                depleted: node.depleted,
                minedBy: playerId,
              },
            })
          }
          break

        case "chat_message":
          if (playerId && gameState.players.has(playerId)) {
            const player = gameState.players.get(playerId)

            // Broadcast chat message to all players
            broadcastToAll({
              type: "chat_message",
              data: {
                playerId: playerId,
                username: player.username,
                message: data.data.message,
                timestamp: Date.now(),
              },
            })
          }
          break

        case "ping":
          // Respond to heartbeat
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }))
          if (playerId && gameState.players.has(playerId)) {
            gameState.players.get(playerId).lastSeen = Date.now()
          }
          break

        default:
          console.log("Unknown message type:", data.type)
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  })

  ws.on("close", () => {
    if (playerId && gameState.players.has(playerId)) {
      const player = gameState.players.get(playerId)
      console.log(`👋 Player disconnected: ${player.username} (${playerId})`)

      gameState.players.delete(playerId)
      gameState.gameStats.activeConnections = gameState.players.size

      // Notify other players
      broadcastToAll({
        type: "player_left",
        data: { playerId: playerId },
      })
    }
  })

  ws.on("error", (error) => {
    console.error("WebSocket error:", error)
  })
})

// Clean up inactive players
setInterval(() => {
  const now = Date.now()
  const timeout = 60000 // 1 minute timeout

  for (const [playerId, player] of gameState.players.entries()) {
    if (now - player.lastSeen > timeout) {
      console.log(`🧹 Cleaning up inactive player: ${player.username}`)
      gameState.players.delete(playerId)
      gameState.gameStats.activeConnections = gameState.players.size

      broadcastToAll({
        type: "player_left",
        data: { playerId: playerId },
      })
    }
  }
}, 30000) // Check every 30 seconds

// API endpoints for game statistics
app.get("/api/stats", (req, res) => {
  res.json({
    ...gameState.gameStats,
    activeConnections: gameState.players.size,
    resourceNodes: gameState.resourceNodes.size,
    uptime: Date.now() - gameState.gameStats.startTime,
  })
})

app.get("/api/players", (req, res) => {
  const players = Array.from(gameState.players.values()).map((player) => ({
    playerId: player.playerId,
    username: player.username,
    position: player.position,
    submarine: player.submarine,
    connectionTime: player.connectionTime,
    lastSeen: player.lastSeen,
  }))

  res.json(players)
})

// Handle 404 for unknown routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: "This is the Ocean Mining multiplayer server. Use WebSocket connections for game communication.",
    availableRoutes: {
      "GET /": "Server information",
      "GET /health": "Health check",
      "GET /api/stats": "Game statistics",
      "GET /api/players": "Active players list",
      WebSocket: "ws://[server-url] for game connections",
    },
  })
})

// Initialize game systems
initializeResourceNodes()
startResourceGeneration()

console.log("🌊 Ocean Mining multiplayer server initialized")
console.log(`📊 Game stats: ${gameState.resourceNodes.size} resource nodes generated`)

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("✅ Server closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully")
  server.close(() => {
    console.log("✅ Server closed")
    process.exit(0)
  })
})
