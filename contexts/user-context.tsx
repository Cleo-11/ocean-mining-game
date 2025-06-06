"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  initializeServices,
  getServiceStatus,
  getPlayerProgress,
  updatePlayerProgress as updatePlayerProgressDB,
} from "@/lib/db-service"

interface User {
  walletAddress: string
  username: string
}

interface PlayerProgress {
  currentTier: number
  selectedSubmarine: number
  purchasedSubmarines: number[]
  resources: {
    nickel: number
    cobalt: number
    copper: number
    manganese: number
  }
  balance: number
  playerStats: any
  position: {
    x: number
    y: number
    rotation: number
  }
}

interface ServiceStatus {
  moralis: boolean
  supabase: boolean
  usingLocalStorage: boolean
}

interface UserContextType {
  user: User | null
  playerProgress: PlayerProgress | null
  isLoading: boolean
  isAuthenticated: boolean
  serviceStatus: ServiceStatus
  login: (username: string) => Promise<void>
  logout: () => void
  updatePlayerProgress: (data: Partial<PlayerProgress>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    moralis: false,
    supabase: false,
    usingLocalStorage: true,
  })
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing app services...")

        // Initialize services
        await initializeServices()

        // Get service status
        const status = await getServiceStatus()
        setServiceStatus(status)

        console.log("✅ App initialization complete", status)
      } catch (error) {
        console.error("❌ Failed to initialize app:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem("oceanMiningToken")
    const storedUser = localStorage.getItem("oceanMiningUser")
    const storedProgress = localStorage.getItem("oceanMiningProgress")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))

      // Try to fetch from database first, fallback to local storage
      if (!serviceStatus.usingLocalStorage) {
        fetchPlayerProgress(JSON.parse(storedUser).walletAddress).then((success) => {
          if (!success && storedProgress) {
            // Fallback to local storage
            setPlayerProgress(JSON.parse(storedProgress))
          }
          setIsLoading(false)
        })
      } else if (storedProgress) {
        // Use local storage if database not available
        setPlayerProgress(JSON.parse(storedProgress))
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [serviceStatus])

  const fetchPlayerProgress = async (walletAddress: string): Promise<boolean> => {
    if (serviceStatus.usingLocalStorage) return false

    try {
      const data = await getPlayerProgress(walletAddress)
      if (data) {
        setPlayerProgress(data)
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to fetch player progress from database:", error)
      return false
    }
  }

  const login = async (username: string) => {
    setIsLoading(true)

    try {
      let walletAddress = ""
      let signature = ""

      // Try to connect to MetaMask
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length === 0) {
          throw new Error("No accounts found")
        }

        walletAddress = accounts[0]

        // Step 1: Get nonce and message to sign
        const nonceResponse = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
        })

        const { message, nonce } = await nonceResponse.json()

        // Step 2: Request signature from wallet
        signature = await (window as any).ethereum.request({
          method: "personal_sign",
          params: [message, accounts[0]],
        })
      } else {
        // Demo mode for testing
        walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`
        signature = "demo_signature"
      }

      // Step 3: Verify signature and authenticate
      const authResponse = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          signature,
          message: `Demo message for ${walletAddress}`,
          username,
        }),
      })

      if (!authResponse.ok) {
        throw new Error("Authentication failed")
      }

      const { token: authToken, user: userData } = await authResponse.json()

      // Save to state and localStorage
      setToken(authToken)
      setUser(userData)
      localStorage.setItem("oceanMiningToken", authToken)
      localStorage.setItem("oceanMiningUser", JSON.stringify(userData))

      // Try to fetch player progress from database
      const success = await fetchPlayerProgress(userData.walletAddress)

      if (!success) {
        // Create default player progress for local storage
        const defaultProgress = {
          currentTier: 1,
          selectedSubmarine: 1,
          purchasedSubmarines: [1],
          resources: {
            nickel: 150,
            cobalt: 75,
            copper: 75,
            manganese: 40,
          },
          balance: 500,
          playerStats: {
            health: 100,
            energy: 100,
            capacity: { nickel: 0, cobalt: 0, copper: 0, manganese: 0 },
            maxCapacity: { nickel: 100, cobalt: 50, copper: 50, manganese: 25 },
            depth: 1000,
            speed: 1,
            miningRate: 1,
            tier: 1,
          },
          position: { x: 500, y: 500, rotation: 0 },
        }
        setPlayerProgress(defaultProgress)
        localStorage.setItem("oceanMiningProgress", JSON.stringify(defaultProgress))
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setPlayerProgress(null)
    setToken(null)
    localStorage.removeItem("oceanMiningToken")
    localStorage.removeItem("oceanMiningUser")
    localStorage.removeItem("oceanMiningProgress")
  }

  const updatePlayerProgress = async (data: Partial<PlayerProgress>) => {
    if (!user) return

    // Update local state immediately
    setPlayerProgress((prev) => (prev ? { ...prev, ...data } : null))

    // Save to local storage as backup
    const updatedProgress = { ...playerProgress, ...data }
    localStorage.setItem("oceanMiningProgress", JSON.stringify(updatedProgress))

    // Try to save to database if connected
    if (!serviceStatus.usingLocalStorage) {
      try {
        const result = await updatePlayerProgressDB(user.walletAddress, data)
        if (result) {
          setPlayerProgress(result)
          console.log("💾 Saved player progress to database")
        }
      } catch (error) {
        console.warn("Failed to save to database, using local storage:", error)
      }
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        playerProgress,
        isLoading,
        isAuthenticated: !!user,
        serviceStatus,
        login,
        logout,
        updatePlayerProgress,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
