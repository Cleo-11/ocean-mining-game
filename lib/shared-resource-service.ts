import { create } from "zustand"
import type { ResourceNode, PlayerPosition, OtherPlayer, PlayerStats } from "@/lib/types"
import { type Socket, io } from "socket.io-client"

// Generate local resource nodes for offline mode
const generateResourceNodes = () => {
  const types = ["nickel", "cobalt", "copper", "manganese"] as const
  return Array.from({ length: 30 }, (_, i) => ({
    id: `node-${i}`,
    position: {
      x: Math.random() * 1800 + 100,
      y: Math.random() * 1800 + 100,
    },
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.floor(Math.random() * 20) + 5,
    depleted: false,
    size: Math.random() * 15 + 15,
    pulseSpeed: Math.random() * 2 + 1,
    pulsePhase: Math.random() * Math.PI * 2,
  }))
}

// Define events for communication with the server
interface ServerToClientEvents {
  resourceUpdated: (nodeId: string, newAmount: number, depleted: boolean) => void
  resourcesInitialized: (nodes: ResourceNode[]) => void
  playerJoined: (player: OtherPlayer) => void
  playerLeft: (playerId: string) => void
  playerMoved: (playerId: string, position: PlayerPosition) => void
  playerMined: (playerId: string, nodeId: string) => void
  mapExpanded: (data: {
    oldSize: number
    newSize: number
    newResources: ResourceNode[]
    totalResources: number
    message: string
  }) => void
  mapInfo: (data: { size: number; resourceCount: number }) => void
  gameState: (data: {
    players: OtherPlayer[]
    resourceNodes: ResourceNode[]
    leaderboard: Array<{ id: string; username: string; score: number }>
    mapSize: number
  }) => void
  chatMessage: (message: {
    id: string
    sender: string
    text: string
    timestamp: number
  }) => void
  error: (message: string) => void
}

interface ClientToServerEvents {
  joinGame: (username: string, submarineType: number) => void
  leaveGame: () => void
  updatePosition: (position: PlayerPosition) => void
  mineResource: (nodeId: string, amount: number) => void
  upgradeSubmarine: (newType: number, newStats: PlayerStats) => void
}

// Create a store to manage the shared resource state
interface SharedResourceState {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  connected: boolean
  resourceNodes: ResourceNode[]
  otherPlayers: OtherPlayer[]
  serverId: string | null
  username: string
  submarineType: number
  connecting: boolean
  error: string | null
  mapSize: number
  mapExpansions: number
  lastExpansionMessage: string | null

  // Methods
  connect: (serverUrl: string, username: string, submarineType: number) => void
  disconnect: () => void
  updatePlayerPosition: (position: PlayerPosition) => void
  mineResource: (nodeId: string, amount: number) => void
  upgradeSubmarine: (submarineType: number, stats: PlayerStats) => void
  sendChatMessage: (message: string) => void
}

export const useSharedResourceStore = create<SharedResourceState>((set, get) => ({
  socket: null,
  connected: false,
  resourceNodes: [],
  otherPlayers: [],
  serverId: null,
  username: "",
  submarineType: 1,
  connecting: false,
  error: null,
  mapSize: 2000,
  mapExpansions: 0,
  lastExpansionMessage: null,

  connect: (serverUrl, username, submarineType) => {
    try {
      set({ connecting: true, error: null, username, submarineType })

      // Create socket connection
      const socket = io(serverUrl, {
        reconnectionAttempts: 5,
        timeout: 10000,
        autoConnect: true,
        transports: ["websocket", "polling"],
      })

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!get().connected) {
          console.log("Connection timeout - running in offline mode")
          set({
            connecting: false,
            error: "Connection timeout - running in offline mode",
            resourceNodes: generateResourceNodes(),
          })
        }
      }, 5000)

      socket.on("connect", () => {
        clearTimeout(connectionTimeout)
        console.log("Connected to resource server")
        set({
          socket,
          connected: true,
          connecting: false,
          serverId: socket.id,
        })

        // Join the game
        socket.emit("joinGame", username, submarineType)
      })

      socket.on("connect_error", (err) => {
        console.error("Connection error:", err)
        set({
          error: `Failed to connect: ${err.message}`,
          connecting: false,
        })
      })

      socket.on("disconnect", () => {
        console.log("Disconnected from resource server")
        set({ connected: false })
      })

      // Handle map information
      socket.on("mapInfo", (data) => {
        console.log("Map info received:", data)
        set({
          mapSize: data.size,
        })
      })

      // Handle map expansion
      socket.on("mapExpanded", (data) => {
        console.log("Map expanded:", data)
        set((state) => ({
          mapSize: data.newSize,
          mapExpansions: state.mapExpansions + 1,
          lastExpansionMessage: data.message,
          resourceNodes: [...state.resourceNodes, ...data.newResources],
        }))

        // Show expansion notification
        if (typeof window !== "undefined") {
          // You can trigger a toast notification here
          console.log(`🗺️ ${data.message}`)
        }
      })

      // Handle resource updates
      socket.on("resourcesInitialized", (nodes) => {
        console.log("Resources initialized:", nodes.length)
        set({ resourceNodes: nodes })
      })

      socket.on("resourceUpdated", (nodeId, newAmount, depleted) => {
        set((state) => ({
          resourceNodes: state.resourceNodes.map((node) =>
            node.id === nodeId ? { ...node, amount: newAmount, depleted } : node,
          ),
        }))
      })

      // Handle game state updates
      socket.on("gameState", (data) => {
        console.log("Game state updated:", data)
        set((state) => ({
          otherPlayers: data.players.filter((p) => p.id !== state.serverId),
          resourceNodes: data.resourceNodes,
          mapSize: data.mapSize || state.mapSize,
        }))
      })

      // Handle player events
      socket.on("playerJoined", (player) => {
        console.log("Player joined:", player.username)
        set((state) => ({
          otherPlayers: [...state.otherPlayers, player],
        }))
      })

      socket.on("playerLeft", (playerId) => {
        console.log("Player left:", playerId)
        set((state) => ({
          otherPlayers: state.otherPlayers.filter((p) => p.id !== playerId),
        }))
      })

      socket.on("playerMoved", (playerId, position) => {
        set((state) => ({
          otherPlayers: state.otherPlayers.map((player) => (player.id === playerId ? { ...player, position } : player)),
        }))
      })

      socket.on("playerMined", (playerId, nodeId) => {
        console.log(`Player ${playerId} is mining node ${nodeId}`)
      })

      // Handle chat messages
      socket.on("chatMessage", (message) => {
        console.log("Chat message received:", message)
        // You can handle chat messages here
      })

      socket.on("error", (message) => {
        console.error("Server error:", message)
        set({ error: message })
      })
    } catch (err) {
      console.error("Failed to connect:", err)
      set({
        error: err instanceof Error ? err.message : "Unknown error connecting to server",
        connecting: false,
      })
    }
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.emit("leaveGame")
      socket.disconnect()
      set({
        socket: null,
        connected: false,
        resourceNodes: [],
        otherPlayers: [],
        serverId: null,
        mapSize: 2000,
        mapExpansions: 0,
        lastExpansionMessage: null,
      })
    }
  },

  updatePlayerPosition: (position) => {
    const { socket, connected } = get()
    if (socket && connected) {
      socket.emit("updatePosition", position)
    }
  },

  mineResource: (nodeId, amount) => {
    const { socket, connected } = get()
    if (socket && connected) {
      socket.emit("mineResource", nodeId, amount)
    }
  },

  upgradeSubmarine: (submarineType, stats) => {
    const { socket, connected } = get()
    if (socket && connected) {
      socket.emit("upgradeSubmarine", submarineType, stats)
      set({ submarineType })
    }
  },

  sendChatMessage: (message) => {
    const { socket, connected } = get()
    if (socket && connected) {
      socket.emit("sendChatMessage", message)
    }
  },
}))
