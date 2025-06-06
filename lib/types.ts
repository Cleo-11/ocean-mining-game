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
  position: [number, number, number]
  type: ResourceType
  amount: number
  depleted: boolean
}

export interface PlayerStats {
  health: number
  energy: number
  capacity: {
    nickel: number
    cobalt: number
    copper: number
    manganese: number
  }
  maxCapacity: {
    nickel: number
    cobalt: number
    copper: number
    manganese: number
  }
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
  position: [number, number, number]
  rotation: [number, number, number]
  submarineType: number
  username: string
}

export interface PlayerPosition {
  x: number
  y: number
  rotation: number
}

export interface OceanMiningGameProps {
  walletConnected: boolean
  gameState: GameState
  setGameState: (state: GameState) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  selectedSubmarine: number
  purchasedSubmarines: number[]
  onSelectSubmarine: (tier: number) => void
  playerStats: PlayerStats
  resources: PlayerResources
  setResources: (resources: PlayerResources | ((prev: PlayerResources) => PlayerResources)) => void
  setPlayerStats: (stats: PlayerStats | ((prev: PlayerStats) => PlayerStats)) => void
  balance: number
  setBalance: (balance: number | ((prev: number) => number)) => void
}
