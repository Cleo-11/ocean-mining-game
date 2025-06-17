"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { GameState, Player } from "@/lib/types"
import { web3Service } from "@/lib/web3-service"
import { apiService } from "@/lib/api-service"
import { socketService } from "@/lib/socket-service"

interface GameContextType {
  state: GameState
  connectWallet: () => Promise<void>
  joinGame: () => Promise<void>
  upgradeSubmarine: () => Promise<void>
  claimDailyReward: () => Promise<void>
  updatePlayerPosition: (x: number, y: number, rotation: number) => void
  mineResource: (resource: string, amount: number, x: number, y: number) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

type GameAction =
  | { type: "SET_PLAYER"; payload: Player }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "ADD_OTHER_PLAYER"; payload: Player }
  | { type: "REMOVE_OTHER_PLAYER"; payload: string }
  | { type: "UPDATE_OTHER_PLAYER"; payload: { id: string; data: Partial<Player> } }
  | { type: "SET_SESSION"; payload: any }
  | { type: "UPDATE_RESOURCES"; payload: any }

const initialState: GameState = {
  player: null,
  otherPlayers: [],
  mineralNodes: [],
  gameSession: null,
  isConnected: false,
  isAuthenticated: false,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PLAYER":
      return { ...state, player: action.payload }
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload }
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload }
    case "ADD_OTHER_PLAYER":
      return {
        ...state,
        otherPlayers: [...state.otherPlayers.filter((p) => p.id !== action.payload.id), action.payload],
      }
    case "REMOVE_OTHER_PLAYER":
      return {
        ...state,
        otherPlayers: state.otherPlayers.filter((p) => p.id !== action.payload),
      }
    case "UPDATE_OTHER_PLAYER":
      return {
        ...state,
        otherPlayers: state.otherPlayers.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.data } : p,
        ),
      }
    case "SET_SESSION":
      return { ...state, gameSession: action.payload }
    case "UPDATE_RESOURCES":
      return {
        ...state,
        player: state.player ? { ...state.player, resources: action.payload } : null,
      }
    default:
      return state
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const connectWallet = async () => {
    try {
      const address = await web3Service.connectWallet()
      const message = `Sign this message to authenticate with Ocean Mining Game: ${Date.now()}`
      const signature = await web3Service.signMessage(message)

      const authResponse = await apiService.authenticateWallet(address, signature, message)

      if (authResponse.success) {
        // Get player profile
        const profile = await web3Service.getPlayerProfile(address)
        const balance = await web3Service.getOCXBalance(address)

        const player: Player = {
          id: address,
          address,
          username: `Player_${address.slice(-6)}`,
          position: { x: 0, y: 0 },
          stats: {
            health: 100,
            energy: 100,
            capacity: { nickel: 0, cobalt: 0, copper: 0, manganese: 0 },
            maxCapacity: { nickel: 100, cobalt: 50, copper: 50, manganese: 25 },
            depth: 1000,
            speed: 1,
            miningRate: 1,
            tier: profile.submarineType,
          },
          resources: { nickel: 0, cobalt: 0, copper: 0, manganese: 0 },
          tokens: Number.parseFloat(balance),
          submarineType: profile.submarineType,
          level: profile.level,
          isConnected: true,
        }

        dispatch({ type: "SET_PLAYER", payload: player })
        dispatch({ type: "SET_AUTHENTICATED", payload: true })

        localStorage.setItem("sessionToken", authResponse.sessionToken)
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    }
  }

  const joinGame = async () => {
    try {
      if (!state.player) {
        throw new Error("Player not authenticated")
      }

      const sessionToken = localStorage.getItem("sessionToken")
      if (!sessionToken) {
        throw new Error("No session token")
      }

      // Connect to socket server
      await socketService.connect()
      dispatch({ type: "SET_CONNECTED", payload: true })

      // Join game session
      const sessionResponse = await apiService.joinGameSession(state.player.address, sessionToken)

      if (sessionResponse.success) {
        dispatch({ type: "SET_SESSION", payload: sessionResponse })

        // Join socket session
        socketService.joinSession(sessionResponse.sessionId, {
          address: state.player.address,
          submarineType: state.player.submarineType,
          level: state.player.level,
          joinedAt: Date.now(),
        })

        // Set up socket event listeners
        setupSocketListeners()
      }
    } catch (error) {
      console.error("Failed to join game:", error)
      throw error
    }
  }

  const setupSocketListeners = () => {
    socketService.on("player-joined", (data) => {
      const newPlayer: Player = {
        id: data.playerId,
        address: data.playerData.address,
        username: `Player_${data.playerData.address.slice(-6)}`,
        position: { x: Math.random() * 800, y: Math.random() * 600 },
        stats: {
          health: 100,
          energy: 100,
          capacity: { nickel: 0, cobalt: 0, copper: 0, manganese: 0 },
          maxCapacity: { nickel: 100, cobalt: 50, copper: 50, manganese: 25 },
          depth: 1000,
          speed: 1,
          miningRate: 1,
          tier: data.playerData.submarineType,
        },
        resources: { nickel: 0, cobalt: 0, copper: 0, manganese: 0 },
        tokens: 0,
        submarineType: data.playerData.submarineType,
        level: data.playerData.level,
        isConnected: true,
      }

      dispatch({ type: "ADD_OTHER_PLAYER", payload: newPlayer })
    })

    socketService.on("player-left", (data) => {
      dispatch({ type: "REMOVE_OTHER_PLAYER", payload: data.playerId })
    })

    socketService.on("player-moved", (data) => {
      dispatch({
        type: "UPDATE_OTHER_PLAYER",
        payload: {
          id: data.playerId,
          data: { position: { x: data.x, y: data.y } },
        },
      })
    })
  }

  const upgradeSubmarine = async () => {
    try {
      if (!state.player) {
        throw new Error("Player not authenticated")
      }

      const tx = await web3Service.upgradeSubmarine()
      await tx.wait()

      // Refresh player data
      const profile = await web3Service.getPlayerProfile(state.player.address)
      const balance = await web3Service.getOCXBalance(state.player.address)

      dispatch({
        type: "SET_PLAYER",
        payload: {
          ...state.player,
          submarineType: profile.submarineType,
          level: profile.level,
          tokens: Number.parseFloat(balance),
        },
      })
    } catch (error) {
      console.error("Submarine upgrade failed:", error)
      throw error
    }
  }

  const claimDailyReward = async () => {
    try {
      if (!state.player) {
        throw new Error("Player not authenticated")
      }

      const tx = await web3Service.claimDailyReward()
      await tx.wait()

      // Refresh balance
      const balance = await web3Service.getOCXBalance(state.player.address)
      dispatch({
        type: "SET_PLAYER",
        payload: { ...state.player, tokens: Number.parseFloat(balance) },
      })
    } catch (error) {
      console.error("Daily reward claim failed:", error)
      throw error
    }
  }

  const updatePlayerPosition = (x: number, y: number, rotation: number) => {
    if (state.player) {
      dispatch({
        type: "SET_PLAYER",
        payload: { ...state.player, position: { x, y } },
      })
      socketService.sendPlayerMove(x, y, rotation)
    }
  }

  const mineResource = (resource: string, amount: number, x: number, y: number) => {
    if (state.player) {
      const newResources = { ...state.player.resources }
      ;(newResources as any)[resource] += amount

      dispatch({ type: "UPDATE_RESOURCES", payload: newResources })
      socketService.sendPlayerMine(resource, amount, x, y)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect()
    }
  }, [])

  const value: GameContextType = {
    state,
    connectWallet,
    joinGame,
    upgradeSubmarine,
    claimDailyReward,
    updatePlayerPosition,
    mineResource,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
