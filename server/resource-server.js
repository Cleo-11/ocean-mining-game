const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

// Generate deterministic resource nodes with a seed
const generateResourceNodes = (seed = "ocean-mining-default-seed") => {
  // Simple deterministic random number generator based on seed
  const seedRandom = (min, max, index) => {
    const str = seed + index.toString()
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }
    return min + ((Math.abs(hash) % 1000) / 1000) * (max - min)
  }

  const types = ["nickel", "cobalt", "copper", "manganese"]
  return Array.from({ length: 30 }, (_, i) => ({
    id: `node-${i}`,
    position: {
      x: seedRandom(100, 1900, i * 2),
      y: seedRandom(100, 1900, i * 2 + 1),
    },
    type: types[Math.floor(seedRandom(0, types.length, i + 100)) % types.length],
    amount: Math.floor(seedRandom(5, 25, i + 200)),
    depleted: false,
    size: seedRandom(15, 30, i + 300),
    pulseSpeed: seedRandom(1, 3, i + 400),
    pulsePhase: seedRandom(0, Math.PI * 2, i + 500),
  }))
}

// Add dynamic map configuration at the top after the generateResourceNodes function
const DYNAMIC_MAP_CONFIG = {
  baseSize: 2000, // Base map size for 1-2 players
  playerThreshold: 2, // Players needed before expansion
  expansionPerPlayer: 500, // Additional size per player above threshold
  maxSize: 8000, // Maximum map size
  minResourceDensity: 0.8, // Minimum resources per 100x100 area
  maxResourceDensity: 1.5, // Maximum resources per 100x100 area
}

// Add function to calculate dynamic map size
const calculateMapSize = (playerCount) => {
  if (playerCount <= DYNAMIC_MAP_CONFIG.playerThreshold) {
    return DYNAMIC_MAP_CONFIG.baseSize
  }

  const extraPlayers = playerCount - DYNAMIC_MAP_CONFIG.playerThreshold
  const expansion = extraPlayers * DYNAMIC_MAP_CONFIG.expansionPerPlayer
  const newSize = DYNAMIC_MAP_CONFIG.baseSize + expansion

  return Math.min(newSize, DYNAMIC_MAP_CONFIG.maxSize)
}

// Add function to generate additional resources for map expansion
const generateAdditionalResources = (currentSize, newSize, existingNodes) => {
  if (newSize <= currentSize) return []

  const area = newSize * newSize - currentSize * currentSize
  const targetResourceCount = Math.floor((area / 10000) * DYNAMIC_MAP_CONFIG.minResourceDensity)

  const types = ["nickel", "cobalt", "copper", "manganese"]
  const newResources = []

  for (let i = 0; i < targetResourceCount; i++) {
    let position
    let attempts = 0

    // Generate position in expanded area
    do {
      const edge = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left

      switch (edge) {
        case 0: // Top expansion
          position = {
            x: Math.random() * newSize,
            y: Math.random() * (newSize - currentSize),
          }
          break
        case 1: // Right expansion
          position = {
            x: currentSize + Math.random() * (newSize - currentSize),
            y: Math.random() * currentSize,
          }
          break
        case 2: // Bottom expansion
          position = {
            x: Math.random() * newSize,
            y: currentSize + Math.random() * (newSize - currentSize),
          }
          break
        case 3: // Left expansion (if needed)
          position = {
            x: Math.random() * (newSize - currentSize),
            y: Math.random() * currentSize,
          }
          break
      }

      attempts++
    } while (
      attempts < 10 &&
      existingNodes.some((node) => {
        const dx = node.position.x - position.x
        const dy = node.position.y - position.y
        return Math.sqrt(dx * dx + dy * dy) < 100 // Minimum distance between nodes
      })
    )

    const nodeId = `expansion-node-${Date.now()}-${i}`
    newResources.push({
      id: nodeId,
      position,
      type: types[Math.floor(Math.random() * types.length)],
      amount: Math.floor(Math.random() * 20) + 5,
      depleted: false,
      size: Math.random() * 15 + 15,
      pulseSpeed: Math.random() * 2 + 1,
      pulsePhase: Math.random() * Math.PI * 2,
    })
  }

  return newResources
}

// Initialize server
const app = express()

// Enhanced CORS configuration for production
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.vercel\.com$/,
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  }),
)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.vercel\.com$/,
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Game state
const players = {}

// Add game state variables after the players object
let currentMapSize = DYNAMIC_MAP_CONFIG.baseSize
let resourceNodes = generateResourceNodes("ocean-mining-default-seed")

// Add function to handle map expansion
const handleMapExpansion = () => {
  const playerCount = Object.keys(players).length
  const newMapSize = calculateMapSize(playerCount)

  if (newMapSize > currentMapSize) {
    console.log(`Expanding map from ${currentMapSize} to ${newMapSize} for ${playerCount} players`)

    // Generate additional resources for expanded area
    const newResources = generateAdditionalResources(currentMapSize, newMapSize, resourceNodes)
    resourceNodes = [...resourceNodes, ...newResources]

    // Update map size
    const oldMapSize = currentMapSize
    currentMapSize = newMapSize

    // Broadcast map expansion to all players
    io.emit("mapExpanded", {
      oldSize: oldMapSize,
      newSize: newMapSize,
      newResources,
      totalResources: resourceNodes.length,
      message: `Map expanded! New area available for exploration.`,
    })

    // Update game stats
    gameStats.mapExpansions = (gameStats.mapExpansions || 0) + 1
    gameStats.currentMapSize = currentMapSize

    console.log(`Map expansion complete. Added ${newResources.length} new resource nodes.`)
  }
}

// Update the gameStats object initialization
const gameStats = {
  totalPlayersJoined: 0,
  totalResourcesMined: 0,
  serverStartTime: Date.now(),
  mapExpansions: 0,
  currentMapSize: currentMapSize,
  peakPlayerCount: 0,
}

// Health check endpoint
app.get("/health", (req, res) => {
  const currentPlayers = Object.keys(players).length
  gameStats.peakPlayerCount = Math.max(gameStats.peakPlayerCount, currentPlayers)

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    players: currentPlayers,
    resources: resourceNodes.length,
    uptime: process.uptime(),
    mapSize: currentMapSize,
    stats: gameStats,
  })
})

// Calculate leaderboard
const calculateLeaderboard = () => {
  return Object.values(players)
    .map((player) => ({
      id: player.id,
      username: player.username,
      score: Object.values(player.stats.capacity).reduce((sum, amount) => sum + amount, 0) * 10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

// Periodically respawn depleted resources
setInterval(() => {
  let updated = false
  resourceNodes = resourceNodes.map((node) => {
    if (node.depleted && Math.random() < 0.1) {
      // 10% chance to respawn
      updated = true
      return {
        ...node,
        amount: Math.floor(Math.random() * 15) + 5,
        depleted: false,
      }
    }
    return node
  })

  if (updated) {
    io.emit("resourcesInitialized", resourceNodes)
  }
}, 15000)

// Broadcast leaderboard updates
setInterval(() => {
  if (Object.keys(players).length > 0) {
    const leaderboard = calculateLeaderboard()
    io.emit("gameState", {
      players: Object.values(players).map((p) => ({
        id: p.id,
        position: p.position,
        rotation: p.position.rotation,
        submarineType: p.submarineType,
        username: p.username,
      })),
      resourceNodes,
      leaderboard,
    })
  }
}, 5000)

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id)

  // Send current resource state to new player
  socket.emit("resourcesInitialized", resourceNodes)

  // Handle player joining the game
  socket.on("joinGame", (username, submarineType) => {
    const player = {
      id: socket.id,
      username: username || `Captain${socket.id.slice(-4)}`,
      position: {
        x: 500 + Math.random() * 100,
        y: 500 + Math.random() * 100,
        rotation: 0,
      },
      submarineType: submarineType || 1,
      stats: {
        health: 100,
        energy: 100,
        capacity: { nickel: 0, cobalt: 0, copper: 0, manganese: 0 },
        maxCapacity: { nickel: 50, cobalt: 50, copper: 50, manganese: 50 },
        depth: 0,
        speed: 5,
        miningRate: 1,
        tier: submarineType || 1,
      },
      joinedAt: Date.now(),
    }

    players[socket.id] = player
    gameStats.totalPlayersJoined++

    // Check if map needs expansion
    handleMapExpansion()

    // Send current map size and resources to new player
    socket.emit("mapInfo", {
      size: currentMapSize,
      resourceCount: resourceNodes.length,
    })

    // Notify all other clients about the new player
    socket.broadcast.emit("playerJoined", {
      id: player.id,
      position: player.position,
      rotation: player.position.rotation,
      submarineType: player.submarineType,
      username: player.username,
    })

    // Send existing players to the new player
    Object.values(players).forEach((existingPlayer) => {
      if (existingPlayer.id !== socket.id) {
        socket.emit("playerJoined", {
          id: existingPlayer.id,
          position: existingPlayer.position,
          rotation: existingPlayer.position.rotation,
          submarineType: existingPlayer.submarineType,
          username: existingPlayer.username,
        })
      }
    })

    // Send initial game state
    socket.emit("gameState", {
      players: Object.values(players).map((p) => ({
        id: p.id,
        position: p.position,
        rotation: p.position.rotation,
        submarineType: p.submarineType,
        username: p.username,
      })),
      resourceNodes,
      leaderboard: calculateLeaderboard(),
      mapSize: currentMapSize,
    })

    console.log(`Player joined: ${player.username} (${socket.id})`)
  })

  // Handle player movement updates
  socket.on("updatePosition", (position) => {
    if (players[socket.id]) {
      players[socket.id].position = position

      // Broadcast player position to other players
      socket.broadcast.emit("playerMoved", socket.id, position)
    }
  })

  // Handle resource mining
  socket.on("mineResource", (nodeId, amount) => {
    const nodeIndex = resourceNodes.findIndex((node) => node.id === nodeId)

    if (nodeIndex !== -1 && !resourceNodes[nodeIndex].depleted && players[socket.id]) {
      const node = resourceNodes[nodeIndex]
      const mineAmount = Math.min(amount || 1, node.amount)
      const newAmount = Math.max(0, node.amount - mineAmount)
      const depleted = newAmount <= 0

      // Update resource
      resourceNodes[nodeIndex] = {
        ...node,
        amount: newAmount,
        depleted,
      }

      // Update player stats
      const player = players[socket.id]
      if (player.stats.capacity[node.type] !== undefined) {
        player.stats.capacity[node.type] += mineAmount
        gameStats.totalResourcesMined += mineAmount
      }

      // Broadcast resource update to all players
      io.emit("resourceUpdated", nodeId, newAmount, depleted)

      // Notify clients that this player is mining (for visual effects)
      socket.broadcast.emit("playerMined", socket.id, nodeId)

      console.log(`Player ${socket.id} mined ${mineAmount} ${node.type} from node ${nodeId}`)
    }
  })

  // Handle chat messages
  socket.on("sendChatMessage", (text) => {
    if (players[socket.id] && text && text.trim().length > 0) {
      const message = {
        id: `msg-${Date.now()}-${socket.id}`,
        sender: players[socket.id].username,
        text: text.trim().slice(0, 200), // Limit message length
        timestamp: Date.now(),
      }

      // Broadcast to all players
      io.emit("chatMessage", message)

      console.log(`Chat message from ${players[socket.id].username}: ${text}`)
    }
  })

  // Handle submarine upgrades
  socket.on("upgradeSubmarine", (newType, newStats) => {
    if (players[socket.id]) {
      players[socket.id].submarineType = newType
      if (newStats) {
        players[socket.id].stats = { ...players[socket.id].stats, ...newStats }
      }

      // Broadcast upgrade to other players
      socket.broadcast.emit("playerMoved", socket.id, players[socket.id].position)

      console.log(`Player ${socket.id} upgraded to tier ${newType}`)
    }
  })

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    if (players[socket.id]) {
      console.log(`Player disconnected: ${players[socket.id].username} (${socket.id}) - ${reason}`)

      // Notify other players
      io.emit("playerLeft", socket.id)

      // Remove player
      delete players[socket.id]

      // Check if map can be shrunk (optional - you might want to keep expanded areas)
      // handleMapExpansion() // Uncomment if you want dynamic shrinking
    }
  })

  // Handle explicit leave
  socket.on("leaveGame", () => {
    if (players[socket.id]) {
      console.log(`Player left game: ${players[socket.id].username} (${socket.id})`)

      // Notify other players
      io.emit("playerLeft", socket.id)

      // Remove player
      delete players[socket.id]
    }
  })
})

// Serve a simple status page
app.get("/", (req, res) => {
  const uptime = process.uptime()
  const uptimeHours = Math.floor(uptime / 3600)
  const uptimeMinutes = Math.floor((uptime % 3600) / 60)
  const currentPlayers = Object.keys(players).length

  res.send(`
    <html>
      <head>
        <title>Ocean Mining Resource Server</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #0f172a; color: #e2e8f0; margin: 0; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; }
          .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
          .status-card { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; }
          .status-value { font-size: 2em; font-weight: bold; color: #06b6d4; }
          .status-label { color: #94a3b8; font-size: 0.9em; }
          .online { color: #10b981; }
          .map-info { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border: 2px solid #06b6d4; }
          .expansion-indicator { color: #f59e0b; font-weight: bold; }
          .endpoint { background: #1e293b; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #06b6d4; }
          .players-list { background: #1e293b; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .player-item { padding: 10px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
          .player-item:last-child { border-bottom: none; }
          .refresh-btn { background: #06b6d4; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin: 10px 0; }
          .refresh-btn:hover { background: #0891b2; }
        </style>
        <script>
          function refreshPage() { window.location.reload(); }
          setInterval(refreshPage, 30000);
        </script>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #06b6d4; margin: 0;">🌊 Ocean Mining Resource Server</h1>
            <p style="color: #94a3b8; margin: 10px 0;">Dynamic multiplayer game server with expanding world</p>
          </div>
          
          <div class="status-grid">
            <div class="status-card">
              <div class="status-value online">${currentPlayers}</div>
              <div class="status-label">Active Players</div>
            </div>
            <div class="status-card">
              <div class="status-value">${resourceNodes.length}</div>
              <div class="status-label">Resource Nodes</div>
            </div>
            <div class="status-card map-info">
              <div class="status-value">${currentMapSize}x${currentMapSize}</div>
              <div class="status-label">Current Map Size</div>
              ${currentMapSize > DYNAMIC_MAP_CONFIG.baseSize ? '<div class="expansion-indicator">🔄 Expanded World</div>' : ""}
            </div>
            <div class="status-card">
              <div class="status-value">${gameStats.mapExpansions || 0}</div>
              <div class="status-label">Map Expansions</div>
            </div>
          </div>

          <div class="status-grid">
            <div class="status-card">
              <div class="status-value">${gameStats.totalPlayersJoined}</div>
              <div class="status-label">Total Players Joined</div>
            </div>
            <div class="status-card">
              <div class="status-value">${gameStats.totalResourcesMined}</div>
              <div class="status-label">Resources Mined</div>
            </div>
            <div class="status-card">
              <div class="status-value">${gameStats.peakPlayerCount || currentPlayers}</div>
              <div class="status-label">Peak Player Count</div>
            </div>
            <div class="status-card">
              <div class="status-value">${Math.floor((resourceNodes.length / (currentMapSize * currentMapSize)) * 10000 * 100) / 100}</div>
              <div class="status-label">Resource Density</div>
            </div>
          </div>

          <div class="status-card">
            <h2 style="color: #06b6d4; margin-top: 0;">Dynamic World System</h2>
            <p><strong>Base Map Size:</strong> ${DYNAMIC_MAP_CONFIG.baseSize}x${DYNAMIC_MAP_CONFIG.baseSize}</p>
            <p><strong>Expansion Trigger:</strong> ${DYNAMIC_MAP_CONFIG.playerThreshold}+ players</p>
            <p><strong>Expansion Rate:</strong> +${DYNAMIC_MAP_CONFIG.expansionPerPlayer} units per player</p>
            <p><strong>Maximum Size:</strong> ${DYNAMIC_MAP_CONFIG.maxSize}x${DYNAMIC_MAP_CONFIG.maxSize}</p>
            <p><strong>Next Expansion:</strong> ${currentMapSize >= DYNAMIC_MAP_CONFIG.maxSize ? "Maximum reached" : `At ${Math.ceil(currentMapSize / DYNAMIC_MAP_CONFIG.expansionPerPlayer) + DYNAMIC_MAP_CONFIG.playerThreshold} players`}</p>
          </div>

          <div class="status-card">
            <h2 style="color: #06b6d4; margin-top: 0;">Server Information</h2>
            <p><strong>Status:</strong> <span class="online">Running</span></p>
            <p><strong>Uptime:</strong> ${uptimeHours}h ${uptimeMinutes}m</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || "development"}</p>
            <p><strong>Started:</strong> ${new Date(gameStats.serverStartTime).toLocaleString()}</p>
            <button class="refresh-btn" onclick="refreshPage()">Refresh Status</button>
          </div>

          ${
            Object.keys(players).length > 0
              ? `
          <div class="players-list">
            <h2 style="color: #06b6d4; margin-top: 0;">Active Players</h2>
            ${Object.values(players)
              .map(
                (player) => `
              <div class="player-item">
                <div>
                  <strong>${player.username}</strong>
                  <div style="font-size: 0.8em; color: #94a3b8;">
                    Submarine Tier ${player.submarineType} • 
                    Resources: ${Object.values(player.stats.capacity).reduce((sum, amount) => sum + amount, 0)} •
                    Position: (${Math.floor(player.position.x)}, ${Math.floor(player.position.y)})
                  </div>
                </div>
                <div style="color: #10b981; font-size: 0.8em;">
                  Online ${Math.floor((Date.now() - player.joinedAt) / 60000)}m
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

          <div class="status-card">
            <h2 style="color: #06b6d4; margin-top: 0;">API Endpoints</h2>
            <div class="endpoint">
              <strong>GET /</strong> - This status page
            </div>
            <div class="endpoint">
              <strong>GET /health</strong> - Health check endpoint (JSON)
            </div>
            <div class="endpoint">
              <strong>WebSocket</strong> - Socket.IO connection for real-time gameplay
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px; color: #64748b; font-size: 0.9em;">
            <p>Ocean Mining Dynamic Multiplayer Server v2.0</p>
            <p>Built with Node.js, Express, and Socket.IO • Dynamic World System</p>
          </div>
        </div>
      </body>
    </html>
  `)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  io.emit("error", "Server is shutting down for maintenance")
  server.close(() => {
    console.log("Process terminated")
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  io.emit("error", "Server is shutting down")
  server.close(() => {
    console.log("Process terminated")
  })
})

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🌊 Ocean Mining Resource Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`)
  console.log(`Server started at: ${new Date().toISOString()}`)
})
