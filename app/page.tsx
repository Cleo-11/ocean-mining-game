"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { multiplayerService } from "@/lib/multiplayer-service"
import type { GameState, PlayerResources } from "@/lib/types"
import { getSubmarineByTier } from "@/lib/submarine-tiers"

// Dynamically import components that use browser APIs
const OceanMiningGame = dynamic(
  () => import("@/components/ocean-mining-game").then((mod) => ({ default: mod.OceanMiningGame })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mb-4 text-2xl text-cyan-400">🌊 Loading Ocean Mining...</div>
          <div className="h-2 w-64 rounded-full bg-slate-700">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    ),
  },
)

const WalletConnectionModal = dynamic(
  () => import("@/components/wallet-connection-modal").then((mod) => ({ default: mod.WalletConnectionModal })),
  {
    ssr: false,
  },
)

const ResourceSidebar = dynamic(
  () => import("@/components/resource-sidebar").then((mod) => ({ default: mod.ResourceSidebar })),
  {
    ssr: false,
  },
)

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [username, setUsername] = useState("")
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [gameState, setGameState] = useState<GameState>("idle")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Player state with safe defaults
  const [currentTier, setCurrentTier] = useState(1)
  const [resources, setResources] = useState<PlayerResources>({
    nickel: 150,
    cobalt: 75,
    copper: 75,
    manganese: 40,
  })
  const [balance, setBalance] = useState(500)
  const [playerStats, setPlayerStats] = useState({
    depth: 0,
    resourcesMined: 0,
  })

  const [purchasedSubmarines, setPurchasedSubmarines] = useState<number[]>([1]) // Start with tier 1
  const [selectedSubmarine, setSelectedSubmarine] = useState(1) // Start with tier 1

  // Ensure component is mounted before rendering client-side features
  useEffect(() => {
    setMounted(true)
  }, [])

  // Multiplayer connection
  useEffect(() => {
    if (mounted && walletConnected && username && walletAddress) {
      multiplayerService.connect(username, walletAddress)
    }

    return () => {
      if (mounted) {
        multiplayerService.disconnect()
      }
    }
  }, [mounted, walletConnected, username, walletAddress])

  const handleConnectWallet = async (selectedUsername: string) => {
    if (!mounted) return

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setUsername(selectedUsername)
          setWalletConnected(true)
          setShowWalletModal(false)
          console.log("🔗 Wallet connected:", accounts[0])
        }
      } else {
        // Demo mode for testing
        const demoAddress = `0x${Math.random().toString(16).substr(2, 40)}`
        setWalletAddress(demoAddress)
        setUsername(selectedUsername)
        setWalletConnected(true)
        setShowWalletModal(false)
        console.log("🎭 Demo wallet connected:", demoAddress)
      }
    } catch (error) {
      console.error("❌ Wallet connection failed:", error)
    }
  }

  const handlePurchaseSubmarine = (tier: number) => {
    if (!mounted) return

    try {
      const { getSubmarineByTier } = require("@/lib/submarine-tiers")
      const submarine = getSubmarineByTier(tier)

      // Check tier progression - can only buy next tier
      if (tier !== currentTier + 1) {
        console.log(`❌ Cannot purchase Tier ${tier}. Must purchase Tier ${currentTier + 1} first.`)
        return
      }

      // Check if player can afford it
      if (
        resources.nickel >= submarine.upgradeCost.nickel &&
        resources.cobalt >= submarine.upgradeCost.cobalt &&
        resources.copper >= submarine.upgradeCost.copper &&
        resources.manganese >= submarine.upgradeCost.manganese &&
        balance >= submarine.upgradeCost.tokens
      ) {
        // Deduct resources
        setResources((prev) => ({
          nickel: prev.nickel - submarine.upgradeCost.nickel,
          cobalt: prev.cobalt - submarine.upgradeCost.cobalt,
          copper: prev.copper - submarine.upgradeCost.copper,
          manganese: prev.manganese - submarine.upgradeCost.manganese,
        }))

        setBalance((prev) => prev - submarine.upgradeCost.tokens)

        // Update current tier and add to purchased submarines
        setCurrentTier(tier)
        setPurchasedSubmarines((prev) => [...prev, tier])
        setSelectedSubmarine(tier)

        // Update multiplayer
        if (multiplayerService.isConnected()) {
          multiplayerService.updatePlayerSubmarine(`tier${tier}`)
        }

        console.log(`🚢 Purchased ${submarine.name} (Tier ${tier})`)
      } else {
        console.log(`❌ Insufficient resources for Tier ${tier}`)
      }
    } catch (error) {
      console.error("Error purchasing submarine:", error)
    }
  }

  const handleSelectSubmarine = (tier: number) => {
    if (purchasedSubmarines.includes(tier)) {
      setSelectedSubmarine(tier)

      // Update multiplayer
      if (multiplayerService.isConnected()) {
        multiplayerService.updatePlayerSubmarine(`tier${tier}`)
      }

      console.log(`🚢 Selected ${getSubmarineByTier(tier).name} (Tier ${tier})`)
    }
  }

  const handleTrade = (tradeDetails: any) => {
    console.log("Trading:", tradeDetails)
    // Implement trade logic here
  }

  const getConnectionStatusText = () => {
    if (!mounted) return "Loading..."

    const status = multiplayerService.getConnectionStatus()
    const playerCount = multiplayerService.getOtherPlayers().length + 1

    switch (status) {
      case "connected":
        return `${playerCount} players online`
      case "connecting":
        return "Connecting..."
      case "offline":
        return `Offline mode (${playerCount} bots)`
      default:
        return "Disconnected"
    }
  }

  const getConnectionStatusColor = () => {
    if (!mounted) return "bg-gray-400"

    const status = multiplayerService.getConnectionStatus()
    switch (status) {
      case "connected":
        return "bg-green-400"
      case "connecting":
        return "bg-yellow-400"
      case "offline":
        return "bg-blue-400"
      default:
        return "bg-red-400"
    }
  }

  // Show loading screen until mounted
  if (!mounted) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mb-4 text-2xl text-cyan-400">🌊 Loading Ocean Mining...</div>
          <div className="h-2 w-64 rounded-full bg-slate-700">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 animate-pulse"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-900">
      <OceanMiningGame
        walletConnected={walletConnected}
        gameState={gameState}
        setGameState={setGameState}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedSubmarine={selectedSubmarine}
        purchasedSubmarines={purchasedSubmarines}
        onSelectSubmarine={handleSelectSubmarine}
      />

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <WalletConnectionModal onConnect={handleConnectWallet} onClose={() => setShowWalletModal(false)} />
      )}

      {/* Resource Sidebar */}
      <ResourceSidebar
        isOpen={sidebarOpen}
        resources={resources}
        balance={balance}
        onTrade={handleTrade}
        gameState={gameState}
        playerStats={playerStats}
        currentTier={currentTier}
        onPurchaseSubmarine={handlePurchaseSubmarine}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Top Navigation */}
      <div className="absolute left-4 top-4 z-50 flex space-x-2">
        {/* Connect Wallet Button */}
        {!walletConnected && (
          <button
            onClick={() => setShowWalletModal(true)}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 font-medium text-white shadow-lg shadow-cyan-900/30 transition-all hover:shadow-cyan-900/50"
          >
            Connect Wallet
          </button>
        )}

        {/* Menu Button */}
        {walletConnected && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg shadow-purple-900/30 transition-all hover:shadow-purple-900/50"
          >
            📦 Menu
          </button>
        )}
      </div>

      {/* Player Info */}
      {walletConnected && (
        <div className="absolute right-4 top-4 z-50 rounded-lg bg-slate-900/80 p-3 backdrop-blur-sm">
          <div className="text-sm text-slate-300">
            <div className="font-bold text-cyan-400">{username}</div>
            <div className="text-xs">
              {getSubmarineByTier(selectedSubmarine).name} (T{selectedSubmarine})
            </div>
            <div className="text-xs">💰 {balance} OCE</div>
          </div>
        </div>
      )}

      {/* Submarine Selector */}
      {walletConnected && (
        <div className="absolute right-4 top-20 z-50 rounded-lg bg-slate-900/80 p-3 backdrop-blur-sm">
          <div className="mb-2 text-xs text-slate-300">Select Submarine:</div>
          <div className="flex flex-wrap gap-2">
            {purchasedSubmarines.map((tier) => (
              <button
                key={tier}
                onClick={() => handleSelectSubmarine(tier)}
                className={`h-8 w-8 rounded-md text-xs font-bold ${
                  selectedSubmarine === tier
                    ? "bg-cyan-600 text-white"
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

      {/* Connection Status */}
      {walletConnected && (
        <div className="absolute bottom-4 right-4 z-50 rounded-lg bg-slate-900/80 p-2 backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-xs">
            <div className={`h-2 w-2 rounded-full ${getConnectionStatusColor()}`} />
            <span className="text-slate-300">{getConnectionStatusText()}</span>
          </div>
        </div>
      )}

      {/* Server Setup Instructions */}
      {walletConnected && mounted && multiplayerService.isOfflineMode() && (
        <div className="absolute bottom-16 right-4 z-50 max-w-sm rounded-lg bg-blue-900/80 p-3 backdrop-blur-sm">
          <div className="text-xs text-blue-200">
            <div className="font-bold mb-1">🔄 Running in Offline Mode</div>
            <div>Deploy the server to Render and update NEXT_PUBLIC_MULTIPLAYER_SERVER_URL for multiplayer.</div>
          </div>
        </div>
      )}
    </main>
  )
}
