"use client"

import { useState, useEffect } from "react"
import { OceanMiningGame } from "@/components/ocean-mining-game"
import { LandingPage } from "@/components/landing-page"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"
import { WaterCaustics } from "@/components/water-caustics"
import { DeepSeaBackground } from "@/components/deep-sea-background"
import { VisualEffects } from "@/components/visual-effects"
import { NotificationSystem } from "@/components/notification-system"
import { PowerupIndicator } from "@/components/powerup-indicator"
import { ScreenShake } from "@/components/screen-shake"
import { MultiplayerConnection } from "@/components/multiplayer-connection"
import { MultiplayerChat } from "@/components/multiplayer-chat"
import { Leaderboard } from "@/components/leaderboard"
import { PlayerIndicators } from "@/components/player-indicators"
import { useMultiplayerStore } from "@/lib/multiplayer-service"
import { useSharedResourceStore } from "@/lib/shared-resource-service"
import type { GameState } from "@/lib/types"

export default function Home() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [showMultiplayerConnection, setShowMultiplayerConnection] = useState(false)
  const [username, setUsername] = useState("")
  const [walletConnected, setWalletConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [gameState, setGameState] = useState<GameState>("idle")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [depth, setDepth] = useState(0.5)
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 })

  // Notification and effects state
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      message: string
      type: "info" | "success" | "warning" | "error"
      duration: number
    }>
  >([])
  const [powerupActive, setPowerupActive] = useState(false)
  const [powerupType, setPowerupType] = useState<"speed" | "energy" | "mining" | "shield">("speed")
  const [powerupTimeRemaining, setPowerupTimeRemaining] = useState(0)
  const [screenShake, setScreenShake] = useState({
    active: false,
    intensity: 0,
    duration: 0,
  })

  // Multiplayer connection state - Use environment variable or fallback
  const [serverUrl] = useState(() => {
    // In production, use the environment variable
    if (process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL) {
      return process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL
    }

    // For development, use localhost
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:3001"
    }

    // Default production server URL - replace with your Render URL
    return "https://ocean-mining-server.onrender.com"
  })

  // Get multiplayer state from stores
  const multiplayerStore = useMultiplayerStore()
  const {
    connected: multiplayerConnected,
    connecting: multiplayerConnecting,
    error: multiplayerError,
    players: otherPlayers,
    resourceNodes: multiplayerResourceNodes,
    disconnect: disconnectMultiplayer,
  } = multiplayerStore

  const sharedResourceStore = useSharedResourceStore()

  // Handle wallet connection
  const handleConnectWallet = () => {
    setWalletConnected(true)
    setShowWalletModal(false)
    addNotification("Wallet connected successfully!", "success")
  }

  // Handle game start (single player)
  const handleStartSinglePlayer = (username: string) => {
    setUsername(username)
    setGameStarted(true)
    addNotification(`Welcome aboard, Captain ${username}! (Single Player)`, "success")
  }

  // Handle multiplayer connection
  const handleStartMultiplayer = (username: string) => {
    setUsername(username)
    setShowMultiplayerConnection(true)
  }

  // Handle successful multiplayer connection
  const handleMultiplayerConnected = () => {
    setShowMultiplayerConnection(false)
    setGameStarted(true)
    addNotification(`Welcome to the multiplayer ocean, Captain ${username}!`, "success")
  }

  // Handle returning to landing page
  const handleReturnToMenu = () => {
    // Disconnect from multiplayer server
    disconnectMultiplayer()
    sharedResourceStore.disconnect()

    setGameStarted(false)
    setShowMultiplayerConnection(false)
    setGameState("idle")
  }

  const addNotification = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const id = Date.now().toString()
    setNotifications((prev) => [
      ...prev,
      {
        id,
        message,
        type,
        duration: 5000,
      },
    ])
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Add connection status notifications
  useEffect(() => {
    if (multiplayerConnecting) {
      addNotification("Connecting to multiplayer server...", "info")
    }

    if (multiplayerConnected) {
      addNotification("Connected to multiplayer server!", "success")
    }

    if (multiplayerError) {
      addNotification(`Connection error: ${multiplayerError}`, "error")
    }
  }, [multiplayerConnecting, multiplayerConnected, multiplayerError])

  // Example of activating a powerup
  const activatePowerup = (type: "speed" | "energy" | "mining" | "shield") => {
    setPowerupActive(true)
    setPowerupType(type)
    setPowerupTimeRemaining(15000) // 15 seconds

    // Add notification
    addNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} powerup activated!`, "success")

    // Add screen shake
    setScreenShake({
      active: true,
      intensity: 5,
      duration: 300,
    })
  }

  // Update powerup timer
  useEffect(() => {
    if (!powerupActive) return

    const interval = setInterval(() => {
      setPowerupTimeRemaining((prev) => {
        if (prev <= 100) {
          clearInterval(interval)
          setPowerupActive(false)
          addNotification(`${powerupType.charAt(0).toUpperCase() + powerupType.slice(1)} powerup expired!`, "info")
          return 0
        }
        return prev - 100
      })
    }, 100)

    return () => clearInterval(interval)
  }, [powerupActive, powerupType])

  // Clean up connections when unmounting
  useEffect(() => {
    return () => {
      disconnectMultiplayer()
      sharedResourceStore.disconnect()
    }
  }, [disconnectMultiplayer])

  // Determine which resource nodes to use
  const resourceNodes = multiplayerConnected ? multiplayerResourceNodes : sharedResourceStore.resourceNodes

  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-900">
      {/* Enhanced Background Effects */}
      <DeepSeaBackground depth={depth} />
      <WaterCaustics intensity={0.8} speed={0.5} />

      {!gameStarted ? (
        // Landing Page
        <LandingPage
          onStartSinglePlayer={handleStartSinglePlayer}
          onStartMultiplayer={handleStartMultiplayer}
          onConnectWallet={handleConnectWallet}
          walletConnected={walletConnected}
        />
      ) : (
        // Game Canvas
        <>
          <OceanMiningGame
            walletConnected={walletConnected}
            gameState={gameState}
            setGameState={setGameState}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onDepthChange={setDepth}
            onAddNotification={addNotification}
            onActivatePowerup={activatePowerup}
            onScreenShake={setScreenShake}
            resourceNodes={resourceNodes}
            otherPlayers={otherPlayers}
            username={username}
            isMultiplayer={multiplayerConnected}
            onMineResource={(nodeId, amount) => {
              if (multiplayerConnected) {
                multiplayerStore.mineResource(nodeId, amount)
              } else {
                sharedResourceStore.mineResource(nodeId, amount)
              }
            }}
            onUpdatePosition={(position) => {
              setCameraPosition({ x: position.x, y: position.y })
              if (multiplayerConnected) {
                multiplayerStore.sendPlayerPosition(position)
              } else {
                sharedResourceStore.updatePlayerPosition(position)
              }
            }}
            onUpgradeSubmarine={(type, stats) => {
              if (multiplayerConnected) {
                multiplayerStore.upgradeSubmarine(type, stats)
              } else {
                sharedResourceStore.upgradeSubmarine(type, stats)
              }
            }}
          />

          {/* Player Indicators for Multiplayer */}
          {multiplayerConnected && (
            <PlayerIndicators
              viewportWidth={typeof window !== "undefined" ? window.innerWidth : 1920}
              viewportHeight={typeof window !== "undefined" ? window.innerHeight : 1080}
              cameraX={cameraPosition.x}
              cameraY={cameraPosition.y}
            />
          )}

          {/* Visual Effects Overlays */}
          <VisualEffects active={gameState === "mining"} type="mining" intensity={1.2} />

          {powerupActive && (
            <PowerupIndicator type={powerupType} timeRemaining={powerupTimeRemaining} maxTime={15000} />
          )}

          {screenShake.active && (
            <ScreenShake
              active={screenShake.active}
              intensity={screenShake.intensity}
              duration={screenShake.duration}
            />
          )}

          {/* Return to Menu Button */}
          <button
            onClick={handleReturnToMenu}
            className="absolute left-4 top-4 z-50 rounded-lg bg-slate-800/80 px-4 py-2 text-cyan-400 backdrop-blur-sm transition-all hover:bg-slate-700/80 hover:text-cyan-300"
          >
            Return to Menu
          </button>

          {/* Multiplayer UI Components */}
          {multiplayerConnected && (
            <>
              <MultiplayerChat />
              <Leaderboard />
            </>
          )}
        </>
      )}

      {/* Multiplayer Connection Modal */}
      {showMultiplayerConnection && (
        <MultiplayerConnection onConnect={handleMultiplayerConnected} serverUrl={serverUrl} />
      )}

      {/* Modals */}
      {showWalletModal && (
        <WalletConnectionModal onConnect={handleConnectWallet} onClose={() => setShowWalletModal(false)} />
      )}

      {/* Connect Wallet Button (only shown on game screen, not landing page) */}
      {gameStarted && !walletConnected && (
        <button
          onClick={() => setShowWalletModal(true)}
          className="absolute right-4 top-4 z-50 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 font-medium text-white shadow-lg shadow-cyan-900/30 transition-all hover:shadow-cyan-900/50"
        >
          Connect Wallet
        </button>
      )}

      {/* Multiplayer Status Indicator */}
      {gameStarted && (
        <div className="absolute right-4 top-16 z-50 flex items-center space-x-2 rounded-lg bg-slate-800/80 px-3 py-1 text-sm backdrop-blur-sm">
          <div
            className={`h-2 w-2 rounded-full ${
              multiplayerConnected
                ? "bg-green-500"
                : multiplayerConnecting
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
            }`}
          />
          <span className="text-cyan-100">
            {multiplayerConnected
              ? `Online (${otherPlayers.length} players)`
              : multiplayerConnecting
                ? "Connecting..."
                : "Single Player"}
          </span>
        </div>
      )}

      {/* Server URL Debug Info (only in development) */}
      {process.env.NODE_ENV === "development" && gameStarted && (
        <div className="absolute bottom-4 left-4 z-50 rounded bg-black/50 p-2 text-xs text-white">
          Server: {serverUrl}
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />
    </main>
  )
}
