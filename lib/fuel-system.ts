import { create } from "zustand"
import { persist } from "zustand/middleware"

const REFUEL_DURATION = 45 * 60 * 1000 // 45 minutes in milliseconds
const FUEL_CONSUMPTION_RATES = {
  movement: 0.5, // fuel per second while moving
  mining: 2, // fuel per mining action
  boost: 5, // fuel per boost activation
  idle: 0.1, // fuel per second while idle
}

export interface FuelState {
  currentFuel: number
  maxFuel: number
  isRefueling: boolean
  refuelStartTime: number | null
  refuelEndTime: number | null
  lastUpdateTime: number
  canPlay: boolean
  fuelConsumptionRate: number

  // Actions
  consumeFuel: (amount: number) => boolean
  startRefuel: () => void
  checkRefuelStatus: () => void
  updateFuelConsumption: (deltaTime: number, isMoving: boolean, isIdle: boolean) => void
  resetFuel: () => void
  upgradeFuelCapacity: (newMaxFuel: number) => void
  getRemainingRefuelTime: () => number
}

export const useFuelStore = create<FuelState>()(
  persist(
    (set, get) => ({
      currentFuel: 100,
      maxFuel: 100,
      isRefueling: false,
      refuelStartTime: null,
      refuelEndTime: null,
      lastUpdateTime: Date.now(),
      canPlay: true,
      fuelConsumptionRate: 1,

      consumeFuel: (amount: number) => {
        const state = get()
        if (!state.canPlay || state.isRefueling) return false

        const newFuel = Math.max(0, state.currentFuel - amount)

        set({
          currentFuel: newFuel,
          lastUpdateTime: Date.now(),
        })

        // If fuel reaches 0, start refuel process
        if (newFuel <= 0) {
          get().startRefuel()
          return false
        }

        return true
      },

      startRefuel: () => {
        const now = Date.now()
        set({
          currentFuel: 0,
          isRefueling: true,
          refuelStartTime: now,
          refuelEndTime: now + REFUEL_DURATION,
          canPlay: false,
          lastUpdateTime: now,
        })
      },

      checkRefuelStatus: () => {
        const state = get()
        if (!state.isRefueling || !state.refuelEndTime) return

        const now = Date.now()

        if (now >= state.refuelEndTime) {
          // Refuel complete
          set({
            currentFuel: state.maxFuel,
            isRefueling: false,
            refuelStartTime: null,
            refuelEndTime: null,
            canPlay: true,
            lastUpdateTime: now,
          })
        }
      },

      updateFuelConsumption: (deltaTime: number, isMoving: boolean, isIdle: boolean) => {
        const state = get()
        if (!state.canPlay || state.isRefueling || state.currentFuel <= 0) return

        let consumptionRate = FUEL_CONSUMPTION_RATES.idle

        if (isMoving) {
          consumptionRate = FUEL_CONSUMPTION_RATES.movement
        } else if (isIdle) {
          consumptionRate = FUEL_CONSUMPTION_RATES.idle
        }

        // Apply submarine tier efficiency (higher tier = better fuel efficiency)
        const efficiency = state.fuelConsumptionRate
        const fuelToConsume = (consumptionRate * efficiency * deltaTime) / 1000

        const newFuel = Math.max(0, state.currentFuel - fuelToConsume)

        set({
          currentFuel: newFuel,
          lastUpdateTime: Date.now(),
        })

        // If fuel reaches 0, start refuel process
        if (newFuel <= 0) {
          get().startRefuel()
        }
      },

      resetFuel: () => {
        set({
          currentFuel: get().maxFuel,
          isRefueling: false,
          refuelStartTime: null,
          refuelEndTime: null,
          canPlay: true,
          lastUpdateTime: Date.now(),
        })
      },

      upgradeFuelCapacity: (newMaxFuel: number) => {
        const state = get()
        const fuelPercentage = state.currentFuel / state.maxFuel

        set({
          maxFuel: newMaxFuel,
          currentFuel: Math.floor(newMaxFuel * fuelPercentage),
          lastUpdateTime: Date.now(),
        })
      },

      getRemainingRefuelTime: () => {
        const state = get()
        if (!state.isRefueling || !state.refuelEndTime) return 0

        return Math.max(0, state.refuelEndTime - Date.now())
      },
    }),
    {
      name: "fuel-storage",
      partialize: (state) => ({
        currentFuel: state.currentFuel,
        maxFuel: state.maxFuel,
        isRefueling: state.isRefueling,
        refuelStartTime: state.refuelStartTime,
        refuelEndTime: state.refuelEndTime,
        canPlay: state.canPlay,
        fuelConsumptionRate: state.fuelConsumptionRate,
      }),
    },
  ),
)

export const FUEL_CONSUMPTION_ACTIONS = {
  MOVEMENT: FUEL_CONSUMPTION_RATES.movement,
  MINING: FUEL_CONSUMPTION_RATES.mining,
  BOOST: FUEL_CONSUMPTION_RATES.boost,
  IDLE: FUEL_CONSUMPTION_RATES.idle,
}

// Utility functions
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

export const getFuelColor = (fuelPercentage: number): string => {
  if (fuelPercentage > 0.6) return "#10b981" // Green
  if (fuelPercentage > 0.3) return "#f59e0b" // Yellow
  return "#ef4444" // Red
}

export const getFuelWarningLevel = (fuelPercentage: number): "none" | "low" | "critical" | "empty" => {
  if (fuelPercentage <= 0) return "empty"
  if (fuelPercentage <= 0.1) return "critical"
  if (fuelPercentage <= 0.25) return "low"
  return "none"
}
