import { io, type Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"

export interface PlayerData {
  address: string
  submarineType: number
  level: number
  joinedAt: number
}

export interface GameEvents {
  "player-joined": (data: {
    playerId: string
    playerData: PlayerData
    totalPlayers: number
    players: PlayerData[]
  }) => void
  "player-left": (data: { playerId: string; totalPlayers: number }) => void
  "player-moved": (data: { playerId: string; x: number; y: number; rotation: number }) => void
  "player-mined": (data: { playerId: string; resource: string; amount: number; x: number; y: number }) => void
  "session-full": () => void
  error: (data: { message: string }) => void
}

class SocketService {
  private socket: Socket | null = null
  private connected = false

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL)

      this.socket.on("connect", () => {
        console.log("🔌 Connected to game server")
        this.connected = true
        resolve()
      })

      this.socket.on("disconnect", () => {
        console.log("🔌 Disconnected from game server")
        this.connected = false
      })

      this.socket.on("connect_error", (error) => {
        console.error("🔌 Connection error:", error)
        reject(error)
      })
    })
  }

  joinSession(sessionId: string, playerData: PlayerData) {
    if (!this.socket) {
      throw new Error("Socket not connected")
    }

    this.socket.emit("join-session", { sessionId, playerData })
  }

  sendPlayerMove(x: number, y: number, rotation: number) {
    if (!this.socket) return

    this.socket.emit("player-move", { x, y, rotation })
  }

  sendPlayerMine(resource: string, amount: number, x: number, y: number) {
    if (!this.socket) return

    this.socket.emit("player-mine", { resource, amount, x, y })
  }

  on<K extends keyof GameEvents>(event: K, callback: GameEvents[K]) {
    if (!this.socket) return

    this.socket.on(event, callback)
  }

  off<K extends keyof GameEvents>(event: K, callback?: GameEvents[K]) {
    if (!this.socket) return

    this.socket.off(event, callback)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  isConnected(): boolean {
    return this.connected
  }
}

export const socketService = new SocketService()
