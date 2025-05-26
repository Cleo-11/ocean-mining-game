import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import { v4 as uuidv4 } from "uuid"

// Types
interface ResourceNode {
  id: string
  position: { x: number; y: number }
  type: "nickel" | "cobalt" | "copper" | "manganese"
  amount: number
  depleted: boolean
  size: number
  pulseSpeed?: number
  pulsePhase?: number
}

interface Player {
  id: string
  username: string
  position: { x: number; y: number; rotation: number }
  submarineType: number
  score: number
}

// Generate initial resource nodes
const generateInitialNodes = (): ResourceNode[] => {
  const types = ["nickel", "cobalt", "copper", "manganese"] as const
  return Array.from({ length: 30 }, (_, i) => ({
    id: `node-${i}`,
    position: { x: Math.random() * 1800 + 100, y: Math.random() * 1800 + 100 },
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.floor(Math.random() * 20) + 5,
    depleted: false,
    size: Math.random() * 15 + 15,
    pulseSpeed: Math.random() * 2 + 1,
    pulsePhase: Math.random() * Math.PI * 2,
  }))
}

// Initialize server
const app = express()
app.use(cors())
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Game state
const players: Record<string, Player> = {}
let resourceNodes: ResourceNode[] = generateInitialNodes()
const chatMessages: { id: string; sender: string; text: string; timestamp: number }[] = []

// Resource respawn timer
setInterval(() => {
  resourceNodes = resourceNodes.map((node) => {
    if (node.depleted) {
      // 10% chance to respawn a depleted node
      if (Math.random() < 0.1) {
        const newNode = {
          ...node,
          amount: Math.floor(Math.random() * 20) + 5,
          depleted: false,
        }

        // Notify all clients about the respawned node
        io.emit("resourceRespawned", newNode)

        return newNode
      }
    }
    return node
  })
}, 10000) // Check every 10 seconds

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id)

  // Send current game state to the new client
  socket.emit("gameState", {
    players: Object.values(players),
    resourceNodes,
    leaderboard: Object.values(players).sort((a, b) => b.score - a.score),
  })

  // Send recent chat messages
  chatMessages.slice(-10).forEach((message) => {
    socket.emit("chatMessage", message)
  })

  // Handle player joining the game
  socket.on("joinGame", ({ username, submarineType }) => {
    // Create new player
    const newPlayer = {
      id: socket.id,
      username,
      position: { x: Math.random() * 1000 + 500, y: Math.random() * 1000 + 500, rotation: 0 },
      submarineType,
      score: 0,
    }

    players[socket.id] = newPlayer

    // Notify all clients about the new player
    socket.broadcast.emit("playerJoined", newPlayer)

    console.log(`Player joined: ${username} (${socket.id})`)
  })

  // Handle player movement
  socket.on("movePlayer", (position) => {
    if (players[socket.id]) {
      players[socket.id].position = position

      // Broadcast player movement to all other clients
      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        position,
        username: players[socket.id].username,
        submarineType: players[socket.id].submarineType,
      })
    }
  })

  // Handle resource mining
  socket.on("mineResource", (nodeId) => {
    const node = resourceNodes.find((n) => n.id === nodeId)

    if (node && !node.depleted) {
      // Calculate amount to mine (simplified)
      const amountToMine = Math.min(5, node.amount)

      // Update node
      node.amount -= amountToMine
      if (node.amount <= 0) {
        node.depleted = true
      }

      // Update player score
      if (players[socket.id]) {
        players[socket.id].score += amountToMine * 10
      }

      // Broadcast mining result to all clients
      io.emit("resourceMined", nodeId, socket.id, amountToMine)

      console.log(`Player ${socket.id} mined ${amountToMine} from node ${nodeId}`)
    }
  })

  // Handle chat messages
  socket.on("sendChatMessage", (text) => {
    if (players[socket.id]) {
      const message = {
        id: uuidv4(),
        sender: players[socket.id].username,
        text,
        timestamp: Date.now(),
      }

      // Store message
      chatMessages.push(message)
      if (chatMessages.length > 100) {
        chatMessages.shift() // Keep only the last 100 messages
      }

      // Broadcast message to all clients
      socket.broadcast.emit("chatMessage", message)

      console.log(`Chat from ${message.sender}: ${text}`)
    }
  })

  // Handle submarine upgrades
  socket.on("upgradeSubmarine", (newTier) => {
    if (players[socket.id]) {
      players[socket.id].submarineType = newTier

      // Broadcast upgrade to all clients
      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        position: players[socket.id].position,
        username: players[socket.id].username,
        submarineType: newTier,
      })

      console.log(`Player ${socket.id} upgraded to tier ${newTier}`)
    }
  })

  // Handle resource trading
  socket.on("tradeResource", (resourceType, amount) => {
    if (players[socket.id]) {
      // Update player score (simplified)
      players[socket.id].score += amount * 5

      console.log(`Player ${socket.id} traded ${amount} ${resourceType}`)
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    if (players[socket.id]) {
      // Notify all clients about the player leaving
      io.emit("playerLeft", socket.id)

      // Remove player from the game
      delete players[socket.id]

      console.log(`Player disconnected: ${socket.id}`)
    }
  })

  // Handle explicit leave game
  socket.on("leaveGame", () => {
    if (players[socket.id]) {
      // Notify all clients about the player leaving
      io.emit("playerLeft", socket.id)

      // Remove player from the game
      delete players[socket.id]

      console.log(`Player left game: ${socket.id}`)
    }
  })
})

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Multiplayer server running on port ${PORT}`)
})
