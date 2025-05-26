import { io, type Socket } from "socket.io-client"
import { create } from "zustand"
import type { ResourceNode, OtherPlayer, PlayerPosition, PlayerResources } from "./types"

// Define the types for multiplayer events
export interface ServerToClientEvents {
  playerJoined: (player: OtherPlayer) => void
  playerLeft: (playerId: string) => void
  playerMoved: (player: OtherPlayer) => void
  resourceMined: (nodeId: string, playerId: string, amount: number) => void
  resourceRespawned: (node: ResourceNode) => void
  chatMessage: (message: { id: string; sender: string; text: string; timestamp: number }) => void
  gameState: (state: GameState) => void
  error: (message: string) => void
  resourcesInitialized: (nodes: ResourceNode[]) => void
  resourceUpdated: (nodeId: string, amount: number, depleted: boolean) => void
  playerMined: (playerId: string, nodeId: string) => void
}

export interface ClientToServerEvents {
  joinGame: (playerData: { username: string; submarineType: number }) => void
  leaveGame: () => void
  movePlayer: (position: PlayerPosition) => void
  mineResource: (nodeId: string, amount: number) => void
  sendChatMessage: (text: string) => void
  upgradeSubmarine: (newTier: number, newStats: any) => void
  tradeResource: (resourceType: keyof PlayerResources, amount: number) => void
  updatePosition: (position: PlayerPosition) => void
}

export interface GameState {
  players: OtherPlayer[]
  resourceNodes: ResourceNode[]
  leaderboard: { id: string; username: string; score: number }[]
}

// Create a store to manage multiplayer state
interface MultiplayerState {
  socket: Socket | null
  connected: boolean
  connecting: boolean
  players: OtherPlayer[]
  resourceNodes: ResourceNode[]
  leaderboard: { id: string; username: string; score: number }[]
  playerId: string | null
  username: string
  chatMessages: { id: string; sender: string; text: string; timestamp: number }[]
  error: string | null
  connect: (serverUrl: string, username: string, submarineType: number) => void
  disconnect: () => void
  sendPlayerPosition: (position: PlayerPosition) => void
  mineResource: (nodeId: string, amount: number) => void
  sendChatMessage: (text: string) => void
  upgradeSubmarine: (newTier: number, newStats: any) => void
  tradeResource: (resourceType: keyof PlayerResources, amount: number) => void
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  socket: null,
  connected: false,
  connecting: false,
  players: [],
  resourceNodes: [],
  leaderboard: [],
  playerId: null,
  username: "",
  chatMessages: [],
  error: null,

  connect: (serverUrl: string, username: string, submarineType: number) => {
    const { socket: existingSocket } = get()

    // Disconnect existing socket if any
    if (existingSocket) {
      existingSocket.disconnect()
    }

    set({ connecting: true, error: null })

    try {
      const socket = io(serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      })

      socket.on("connect", () => {
        console.log("Connected to multiplayer server")
        set({
          socket,
          connected: true,
          connecting: false,
          playerId: socket.id,
          username,
          error: null,
        })

        // Join the game
        socket.emit("joinGame", username, submarineType)
      })

      socket.on("connect_error", (error) => {
        console.error("Connection error:", error)
        set({
          connected: false,
          connecting: false,
          error: "Failed to connect to server",
        })
      })

      socket.on("disconnect", (reason) => {
        console.log("Disconnected from multiplayer server:", reason)
        set({ connected: false, connecting: false })
      })

      socket.on("playerJoined", (player) => {
        console.log("Player joined:", player)
        set((state) => ({
          players: [...state.players.filter((p) => p.id !== player.id), player],
        }))
      })

      socket.on("playerLeft", (playerId) => {
        console.log("Player left:", playerId)
        set((state) => ({
          players: state.players.filter((p) => p.id !== playerId),
        }))
      })

      socket.on("playerMoved", (playerId, position) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === playerId ? { ...p, position, rotation: position.rotation } : p)),
        }))
      })

      socket.on("resourcesInitialized", (nodes) => {
        console.log("Resources initialized:", nodes.length)
        set({ resourceNodes: nodes })
      })

      socket.on("resourceUpdated", (nodeId, amount, depleted) => {
        set((state) => ({
          resourceNodes: state.resourceNodes.map((node) => (node.id === nodeId ? { ...node, amount, depleted } : node)),
        }))
      })

      socket.on("resourceMined", (nodeId, playerId, amount) => {
        set((state) => ({
          resourceNodes: state.resourceNodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  amount: Math.max(0, node.amount - amount),
                  depleted: node.amount - amount <= 0,
                }
              : node,
          ),
        }))
      })

      socket.on("resourceRespawned", (node) => {
        set((state) => ({
          resourceNodes: state.resourceNodes.map((n) => (n.id === node.id ? node : n)),
        }))
      })

      socket.on("chatMessage", (message) => {
        set((state) => ({
          chatMessages: [...state.chatMessages.slice(-49), message], // Keep last 50 messages
        }))
      })

      socket.on("gameState", (state) => {
        set({
          players: state.players,
          resourceNodes: state.resourceNodes,
          leaderboard: state.leaderboard,
        })
      })

      socket.on("error", (message) => {
        console.error("Server error:", message)
        set({ error: message })
      })

      // Set socket in state
      set({ socket })
    } catch (error) {
      console.error("Failed to create socket connection:", error)
      set({
        connecting: false,
        connected: false,
        error: "Failed to initialize connection",
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
        connecting: false,
        players: [],
        resourceNodes: [],
        leaderboard: [],
        playerId: null,
        chatMessages: [],
        error: null,
      })
    }
  },

  sendPlayerPosition: (position: PlayerPosition) => {
    const { socket, connected } = get()
    if (socket && connected) {
      socket.emit("updatePosition", position)
    }
  },

  mineResource: (nodeId: string, amount: number) => {
    const { socket, connected } = get()
    if (socket && connected) {
      socket.emit("mineResource", nodeId, amount)
    }
  },

  sendChatMessage: (text: string) => {
    const { socket, connected, username } = get()
    if (socket && connected && text.trim()) {
      socket.emit("sendChatMessage", text)
    }
  },

  upgradeSubmarine: (newTier: number, newStats: any) => {
    const { socket, connected } = get()
    if (socket && connected) {
      socket.emit("upgradeSubmarine", newTier, newStats)
    }
  },

  tradeResource: (resourceType: keyof PlayerResources, amount: number) => {
    const { socket, connected } = get()
    if (socket && connected) {
      socket.emit("tradeResource", resourceType, amount)
    }
  },
}))
