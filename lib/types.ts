export type GameState =
  | "idle"
  | "mining"
  | "resourceGained"
  | "trading"
  | "resourceTraded"
  | "voting"
  | "voteSubmitted"
  | "upgrading"
  | "upgraded"

export type ResourceType = "nickel" | "cobalt" | "copper" | "manganese"

export interface ResourceNode {
  id: string
  position: { x: number; y: number }
  type: ResourceType
  amount: number
  depleted: boolean
  size: number
}

export interface ResourceCapacity {
  nickel: number
  cobalt: number
  copper: number
  manganese: number
}

export interface PlayerStats {
  health: number
  energy: number
  capacity: ResourceCapacity
  maxCapacity: ResourceCapacity
  depth: number
  speed: number
  miningRate: number
  tier: number
}

export interface PlayerResources {
  nickel: number
  cobalt: number
  copper: number
  manganese: number
}

export interface OtherPlayer {
  id: string
  position: { x: number; y: number }
  rotation: number
  submarineType: number
  username: string
}

export interface PlayerPosition {
  x: number
  y: number
  rotation: number
}

export interface Position {
  x: number
  y: number
}

export interface Player {
  id: string
  address: string
  username: string
  position: Position
  stats: PlayerStats
  resources: ResourceCapacity
  tokens: number
  submarineType: number
  level: number
  isConnected: boolean
}

export interface GameSession {
  id: string
  players: Player[]
  maxPlayers: number
  createdAt: number
}

export interface SubmarineTier {
  id: number
  name: string
  cost: number
  stats: {
    health: number
    energy: number
    capacity: number
    speed: number
    miningRate: number
  }
}

export interface MineralNode {
  id: string
  type: "nickel" | "cobalt" | "copper" | "manganese"
  position: Position
  amount: number
  maxAmount: number
  respawnTime: number
}

// Updated GameState interface
export interface GameStatus {
  player: Player | null
  otherPlayers: Player[]
  mineralNodes: MineralNode[]
  gameSession: GameSession | null
  isConnected: boolean
  isAuthenticated: boolean
}
