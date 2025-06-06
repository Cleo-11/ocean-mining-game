"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import type { GameState, PlayerResources, PlayerStats } from "@/lib/types"
import { getSubmarineByTier } from "@/lib/submarine-tiers"
import { useUser } from "@/contexts/user-context"

// Use the 2D canvas-based version instead of the 3D version
const OceanMiningGame = dynamic(
  () => import("@/components/ocean-mining-game").then((mod) => ({ default: mod.OceanMiningGame })),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  },
)

const WalletConnectionModal = dynamic(
  () => import("@/components/wallet-connection-modal").then((mod) => ({ default: mod.WalletConnectionModal })),
  {
    ssr: false,
  },
)

// Loading screen component
function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="mb-4 text-2xl text-cyan-400">🌊 Loading Ocean Mining...</div>
        <div className="h-2 w-64 rounded-full bg-slate-700">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 animate-pulse"></div>
        </div>
        <div className="mt-4 text-sm text-slate-400">Preparing your submarine...</div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, playerProgress, isLoading, isAuthenticated, isMoralisConnected, login, updatePlayerProgress } =
    useUser()

  const [mounted, setMounted] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [gameState, setGameState] = useState<GameState>("idle")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Player state with safe defaults
  const [currentTier, setCurrentTier] = useState(1)
  const [selectedSubmarine, setSelectedSubmarine] = useState(1)
  const [purchasedSubmarines, setPurchasedSubmarines] = useState<number[]>([1])

  const [resources, setResources] = useState<PlayerResources>({
    nickel: 150,
    cobalt: 75,
    copper: 75,
    manganese: 40,
  })

  const [balance, setBalance] = useState(500)
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const initialSubmarine = getSubmarineByTier(1)
    return {
      ...initialSubmarine.baseStats,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
    }
  })

  // Ensure component is mounted before rendering client-side features
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update player stats when selected submarine changes
  useEffect(() => {
    if (!mounted) return

    const submarineData = getSubmarineByTier(selectedSubmarine)
    setPlayerStats((prev) => ({
      ...submarineData.baseStats,
      capacity: prev.capacity,
    }))
  }, [selectedSubmarine, mounted])

  // Load player progress from database when authenticated
  useEffect(() => {
    if (!mounted || !isAuthenticated || !playerProgress) return

    setCurrentTier(playerProgress.currentTier || 1)
    setSelectedSubmarine(playerProgress.selectedSubmarine || 1)
    setPurchasedSubmarines(playerProgress.purchasedSubmarines || [1])
    setResources(
      playerProgress.resources || {
        nickel: 150,
        cobalt: 75,
        copper: 75,
        manganese: 40,
      },
    )
    setBalance(playerProgress.balance || 500)
    setPlayerStats(
      playerProgress.playerStats || {
        ...getSubmarineByTier(1).baseStats,
        capacity: {
          nickel: 0,
          cobalt: 0,
          copper: 0,
          manganese: 0,
        },
      },
    )

    console.log("📊 Loaded player progress:", playerProgress)
  }, [mounted, isAuthenticated, playerProgress])

  // Save player progress to database periodically
  useEffect(() => {
    if (!mounted || !isAuthenticated) return

    const saveInterval = setInterval(() => {
      savePlayerProgress()
    }, 30000)

    return () => clearInterval(saveInterval)
  }, [mounted, isAuthenticated, resources, balance, playerStats, currentTier, selectedSubmarine, purchasedSubmarines])

  // Save player progress when unmounting
  useEffect(() => {
    return () => {
      if (mounted && isAuthenticated) {
        savePlayerProgress()
      }
    }
  }, [mounted, isAuthenticated])

  // Save player progress to database
  const savePlayerProgress = async () => {
    if (!mounted || !isAuthenticated) return

    try {
      await updatePlayerProgress({
        currentTier,
        selectedSubmarine,
        purchasedSubmarines,
        resources,
        balance,
        playerStats,
      })

      console.log(`💾 Saved player progress to ${isMoralisConnected ? "Moralis" : "local storage"}`)
    } catch (error) {
      console.error("Failed to save player progress:", error)
    }
  }

  const handleConnectWallet = async (username: string) => {
    if (!mounted) return

    try {
      await login(username)
      setShowWalletModal(false)
    } catch (error) {
      console.error("❌ Wallet connection failed:", error)
    }
  }

  const handleSelectSubmarine = (tier: number) => {
    if (!mounted || !purchasedSubmarines.includes(tier)) return

    setSelectedSubmarine(tier)
    savePlayerProgress()
    console.log(`🚢 Selected ${getSubmarineByTier(tier).name} (Tier ${tier})`)
  }

  const handlePurchaseSubmarine = (tier: number) => {
    if (!mounted) return

    try {
      const submarine = getSubmarineByTier(tier)

      if (tier !== currentTier + 1) {
        console.log(`❌ Cannot purchase Tier ${tier}. Must purchase Tier ${currentTier + 1} first.`)
        return
      }

      if (
        resources.nickel >= submarine.upgradeCost.nickel &&
        resources.cobalt >= submarine.upgradeCost.cobalt &&
        resources.copper >= submarine.upgradeCost.copper &&
        resources.manganese >= submarine.upgradeCost.manganese &&
        balance >= submarine.upgradeCost.tokens
      ) {
        setResources((prev) => ({
          nickel: prev.nickel - submarine.upgradeCost.nickel,
          cobalt: prev.cobalt - submarine.upgradeCost.cobalt,
          copper: prev.copper - submarine.upgradeCost.copper,
          manganese: prev.manganese - submarine.upgradeCost.manganese,
        }))

        setBalance((prev) => prev - submarine.upgradeCost.tokens)
        setCurrentTier(tier)
        setPurchasedSubmarines((prev) => [...prev, tier])
        setSelectedSubmarine(tier)

        savePlayerProgress()

        console.log(`🚢 Purchased and selected ${submarine.name} (Tier ${tier})`)
      } else {
        console.log(`❌ Insufficient resources for Tier ${tier}`)
      }
    } catch (error) {
      console.error("Error purchasing submarine:", error)
    }
  }

  // Show loading screen until mounted and user context is ready
  if (!mounted || isLoading) {
    return <LoadingScreen />
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-900">
      {/* Ocean Mining Game (2D Canvas version) */}
      <OceanMiningGame
        walletConnected={isAuthenticated}
        gameState={gameState}
        setGameState={setGameState}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedSubmarine={selectedSubmarine}
        purchasedSubmarines={purchasedSubmarines}
        onSelectSubmarine={handleSelectSubmarine}
        playerStats={playerStats}
        resources={resources}
        setResources={setResources}
        setPlayerStats={setPlayerStats}
        balance={balance}
        setBalance={setBalance}
      />

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <WalletConnectionModal onConnect={handleConnectWallet} onClose={() => setShowWalletModal(false)} />
      )}

      {/* Top Navigation */}
      <div className="absolute left-4 top-4 z-50 flex space-x-2">
        {!isAuthenticated && (
          <button
            onClick={() => setShowWalletModal(true)}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 font-medium text-white shadow-lg shadow-cyan-900/30 transition-all hover:shadow-cyan-900/50"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Right Side Navigation */}
      <div className="absolute right-4 top-4 z-50 flex flex-col space-y-3">
        {isAuthenticated && user && (
          <div className="rounded-lg bg-slate-900/80 p-3 backdrop-blur-sm">
            <div className="text-sm text-slate-300">
              <div className="font-bold text-cyan-400">{user.username}</div>
              <div className="text-xs">
                {getSubmarineByTier(selectedSubmarine).name} (T{selectedSubmarine})
              </div>
              <div className="text-xs">💰 {balance} OCE</div>
              <div className="text-xs">📊 {isMoralisConnected ? "Moralis" : "Local"}</div>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg shadow-purple-900/30 transition-all hover:shadow-purple-900/50"
          >
            📦 Menu
          </button>
        )}

        {isAuthenticated && (
          <div className="rounded-lg bg-slate-900/80 p-3 backdrop-blur-sm">
            <div className="mb-2 text-xs text-slate-300">Select Submarine:</div>
            <div className="flex flex-wrap gap-2">
              {purchasedSubmarines.map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleSelectSubmarine(tier)}
                  className={`h-8 w-8 rounded-md text-xs font-bold transition-all ${
                    selectedSubmarine === tier
                      ? "bg-cyan-600 text-white ring-2 ring-cyan-400"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                  title={`Tier ${tier}: ${getSubmarineByTier(tier).name}`}
                >
                  T{tier}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Database Status */}
      <div className="absolute bottom-4 left-4 z-50 rounded-lg bg-slate-900/80 p-2 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-xs">
          <div className={`h-2 w-2 rounded-full ${isMoralisConnected ? "bg-green-400" : "bg-yellow-400"}`} />
          <span className="text-slate-300">{isMoralisConnected ? "Moralis" : "Local Storage"}</span>
          <a href="/admin" className="text-cyan-400 hover:underline">
            Admin
          </a>
        </div>
      </div>

      {/* Game Instructions */}
      {isAuthenticated && (
        <div className="absolute bottom-4 right-4 z-50 rounded-lg bg-slate-900/80 p-3 backdrop-blur-sm">
          <div className="text-xs text-slate-300">
            <div className="mb-1 font-bold text-cyan-400">CONTROLS</div>
            <div>WASD/Arrows - Move</div>
            <div>F - Mine | U - Upgrade | I - Menu</div>
          </div>
        </div>
      )}
    </main>
  )
}
