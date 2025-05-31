"use client"

interface Player {
  playerId: string
  username: string
  position: { x: number; y: number }
  submarine: string
  walletAddress: string
  lastSeen: number
}

interface ResourceNode {
  id: string
  position: { x: number; y: number }
  type: string
  amount: number
  depleted: boolean
  size: number
  spawnTime: number
}

class MultiplayerService {
  private ws: WebSocket | null = null
  private playerId = ""
  private players: Map<string, Player> = new Map()
  private resourceNodes: Map<string, ResourceNode> = new Map()
  private callbacks: Set<Function> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private heartbeatInterval: NodeJS.Timeout | null = null
  private connected = false
  private offlineMode = false

  connect(username: string, walletAddress: string) {
    this.playerId = `${walletAddress.slice(0, 8)}_${username.replace(/\s+/g, "")}`

    // Use the deployed server URL or fallback to environment variable
    const serverUrl = process.env.NEXT_PUBLIC_MULTIPLAYER_SERVER_URL || "wss://ocean-mining-game.onrender.com"

    console.log("🌐 Connecting to multiplayer server:", serverUrl)

    try {
      this.ws = new WebSocket(serverUrl)

      this.ws.onopen = () => {
        console.log("✅ Connected to multiplayer server")
        this.connected = true
        this.offlineMode = false
        this.reconnectAttempts = 0

        // Send join message
        this.sendMessage({
          type: "player_join",
          data: {
            playerId: this.playerId,
            username,
            walletAddress,
            position: { x: 960, y: 540 },
            submarine: "basic",
            timestamp: Date.now(),
          },
        })

        this.startHeartbeat()
        this.notifyCallbacks()
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("❌ Disconnected from multiplayer server")
        this.connected = false
        this.stopHeartbeat()
        this.attemptReconnect(username, walletAddress)
        this.notifyCallbacks()
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.connected = false

        // If connection fails, enable offline mode after max attempts
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log("🔄 Max reconnection attempts reached, switching to offline mode")
          this.enableOfflineMode(username, walletAddress)
        }

        this.notifyCallbacks()
      }

      // Set a timeout to enable offline mode if connection takes too long
      setTimeout(() => {
        if (!this.connected && !this.offlineMode) {
          console.log("⏰ Connection timeout, enabling offline mode")
          this.enableOfflineMode(username, walletAddress)
        }
      }, 10000) // 10 second timeout
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      this.enableOfflineMode(username, walletAddress)
    }
  }

  private enableOfflineMode(username: string, walletAddress: string) {
    console.log("🔄 Running in offline mode")
    this.offlineMode = true
    this.connected = false

    // Generate some mock players for offline mode
    this.generateMockPlayers()
    this.generateMockResources()

    this.notifyCallbacks()
  }

  private generateMockPlayers() {
    const mockPlayers = [
      { id: "bot1", username: "DeepDiver", position: { x: 300, y: 200 }, submarine: "tier2" },
      { id: "bot2", username: "OceanExplorer", position: { x: 800, y: 500 }, submarine: "tier4" },
      { id: "bot3", username: "AbyssalMiner", position: { x: 500, y: 700 }, submarine: "tier3" },
    ]

    mockPlayers.forEach((player) => {
      this.players.set(player.id, {
        playerId: player.id,
        username: player.username,
        position: player.position,
        submarine: player.submarine,
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        lastSeen: Date.now(),
      })
    })

    // Animate mock players
    setInterval(() => {
      if (this.offlineMode) {
        this.players.forEach((player) => {
          // Random movement for mock players
          player.position.x += (Math.random() - 0.5) * 20
          player.position.y += (Math.random() - 0.5) * 20

          // Keep within bounds
          player.position.x = Math.max(100, Math.min(1800, player.position.x))
          player.position.y = Math.max(100, Math.min(1800, player.position.y))
        })
        this.notifyCallbacks()
      }
    }, 5000)
  }

  private generateMockResources() {
    const types = ["nickel", "cobalt", "copper", "manganese"]

    for (let i = 0; i < 20; i++) {
      const node = {
        id: `mock-node-${i}`,
        position: {
          x: Math.random() * 1800 + 100,
          y: Math.random() * 1800 + 100,
        },
        type: types[Math.floor(Math.random() * types.length)],
        amount: Math.floor(Math.random() * 20) + 5,
        depleted: false,
        size: Math.random() * 10 + 20,
        spawnTime: Date.now(),
      }
      this.resourceNodes.set(node.id, node)
    }

    // Generate new resources periodically in offline mode
    setInterval(() => {
      if (this.offlineMode && this.resourceNodes.size < 30) {
        const newNode = {
          id: `mock-node-${Date.now()}`,
          position: {
            x: Math.random() * 1800 + 100,
            y: Math.random() * 1800 + 100,
          },
          type: types[Math.floor(Math.random() * types.length)],
          amount: Math.floor(Math.random() * 20) + 5,
          depleted: false,
          size: Math.random() * 10 + 20,
          spawnTime: Date.now(),
        }
        this.resourceNodes.set(newNode.id, newNode)
        this.notifyCallbacks()
      }
    }, 8000)
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: "ping", timestamp: Date.now() })
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect(username: string, walletAddress: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)

      setTimeout(() => {
        console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}`)
        this.connect(username, walletAddress)
      }, delay)
    } else {
      console.log("🔄 Max reconnection attempts reached, enabling offline mode")
      this.enableOfflineMode(username, walletAddress)
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case "game_state":
        // Initial game state
        this.players.clear()
        this.resourceNodes.clear()

        message.data.players.forEach((player: any) => {
          this.players.set(player.playerId, player)
        })

        message.data.resourceNodes.forEach((node: any) => {
          this.resourceNodes.set(node.id, node)
        })

        console.log(`🎮 Received game state: ${this.players.size} players, ${this.resourceNodes.size} resources`)
        break

      case "player_joined":
        if (message.data.playerId !== this.playerId) {
          this.players.set(message.data.playerId, message.data)
          console.log("👤 Player joined:", message.data.username)
        }
        break

      case "player_left":
        this.players.delete(message.data.playerId)
        console.log("👋 Player left:", message.data.playerId)
        break

      case "player_update":
        if (message.data.playerId !== this.playerId) {
          const player = this.players.get(message.data.playerId)
          if (player) {
            player.position = message.data.position
            player.lastSeen = Date.now()
          }
        }
        break

      case "player_submarine_update":
        if (message.data.playerId !== this.playerId) {
          const player = this.players.get(message.data.playerId)
          if (player) {
            player.submarine = message.data.submarine
          }
        }
        break

      case "resource_spawned":
        this.resourceNodes.set(message.data.id, message.data)
        console.log(`🆕 New resource spawned: ${message.data.type}`)
        break

      case "resource_updated":
        const node = this.resourceNodes.get(message.data.nodeId)
        if (node) {
          node.amount = message.data.amount
          node.depleted = message.data.depleted

          if (node.depleted) {
            setTimeout(() => {
              this.resourceNodes.delete(message.data.nodeId)
            }, 5000) // Remove after 5 seconds
          }
        }
        break

      case "chat_message":
        // Handle chat messages
        console.log(`💬 ${message.data.username}: ${message.data.message}`)
        break

      case "pong":
        // Heartbeat response
        break
    }

    this.notifyCallbacks()
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else if (this.offlineMode) {
      // Handle offline mode actions
      console.log("📴 Offline mode - message not sent:", message.type)
    }
  }

  updatePlayerPosition(position: { x: number; y: number }) {
    this.sendMessage({
      type: "player_position",
      data: {
        playerId: this.playerId,
        position,
        timestamp: Date.now(),
      },
    })
  }

  updatePlayerSubmarine(submarine: string) {
    this.sendMessage({
      type: "player_submarine",
      data: {
        playerId: this.playerId,
        submarine,
        timestamp: Date.now(),
      },
    })
  }

  mineResource(nodeId: string, amount: number) {
    if (this.offlineMode) {
      // Handle mining in offline mode
      const node = this.resourceNodes.get(nodeId)
      if (node) {
        node.amount -= amount
        if (node.amount <= 0) {
          node.depleted = true
          setTimeout(() => {
            this.resourceNodes.delete(nodeId)
          }, 5000)
        }
        this.notifyCallbacks()
      }
      return
    }

    this.sendMessage({
      type: "resource_mined",
      data: {
        nodeId,
        amount,
        timestamp: Date.now(),
      },
    })
  }

  sendChatMessage(message: string) {
    this.sendMessage({
      type: "chat_message",
      data: {
        message,
        timestamp: Date.now(),
      },
    })
  }

  getOtherPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  getResourceNodes(): ResourceNode[] {
    return Array.from(this.resourceNodes.values())
  }

  onUpdate(callback: Function) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  private notifyCallbacks() {
    this.callbacks.forEach((cb) => cb())
  }

  disconnect() {
    if (this.ws) {
      this.sendMessage({
        type: "player_leave",
        data: { playerId: this.playerId },
      })
      this.ws.close()
      this.ws = null
    }
    this.stopHeartbeat()
    this.players.clear()
    this.resourceNodes.clear()
    this.callbacks.clear()
    this.connected = false
    this.offlineMode = false
  }

  isConnected() {
    return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN
  }

  isOfflineMode() {
    return this.offlineMode
  }

  getConnectionStatus() {
    if (this.offlineMode) return "offline"
    if (!this.ws) return "disconnected"
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting"
      case WebSocket.OPEN:
        return "connected"
      case WebSocket.CLOSING:
        return "closing"
      case WebSocket.CLOSED:
        return "disconnected"
      default:
        return "unknown"
    }
  }
}

export const multiplayerService = new MultiplayerService()
