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
  | "outOfFuel"
  | "refueling"

export type ResourceType = "nickel" | "cobalt" | "copper" | "manganese"

export interface ResourceNode {
  id: string
  position: { x: number; y: number }
  type: ResourceType
  amount: number
  depleted: boolean
  size: number
  pulseSpeed?: number
  pulsePhase?: number
}

export interface PlayerStats {
  health: number
  energy: number
  fuel: number
  maxFuel: number
  fuelConsumptionRate: number
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

export interface FuelStatus {
  currentFuel: number
  maxFuel: number
  isRefueling: boolean
  refuelStartTime: number | null
  refuelEndTime: number | null
  canPlay: boolean
}
