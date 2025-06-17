"use client"

import { useState, useEffect, useRef } from "react"
import { PlayerHUD } from "./player-hud"
import { SonarRadar } from "./sonar-radar"
import { ResourceSidebar } from "./resource-sidebar"
import { MineButton } from "./mine-button"
import { UpgradeModal } from "./upgrade-modal"
import { WalletInfo } from "./wallet-info"
import { StorageFullAlert } from "./storage-full-alert"
import { getSubmarineByTier } from "@/lib/submarine-tiers"
import { canMineResource, getStoragePercentage, getResourceColor } from "@/lib/resource-utils"
import type { GameState, ResourceNode, PlayerStats, PlayerResources, OtherPlayer, PlayerPosition } from "@/lib/types"

interface OceanMiningGameProps {
  walletConnected: boolean
  gameState: GameState
  setGameState: (state: GameState) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

// Mock data for other players - in a real app, this would come from a multiplayer backend
const mockOtherPlayers: OtherPlayer[] = [
  { id: "player1", position: { x: 300, y: 200 }, rotation: 0.5, submarineType: 2, username: "DeepDiver" },
  { id: "player2", position: { x: 800, y: 500 }, rotation: -0.8, submarineType: 4, username: "OceanExplorer" },
  { id: "player3", position: { x: 500, y: 700 }, rotation: 0.2, submarineType: 3, username: "AbyssalMiner" },
]

// Generate initial resource nodes
const generateInitialNodes = (): ResourceNode[] => {
  const types = ["nickel", "cobalt", "copper", "manganese"] as const
  return Array.from({ length: 30 }, (_, i) => ({
    id: `node-${i}`,
    position: { x: Math.random() * 1800 + 100, y: Math.random() * 1800 + 100 },
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.floor(Math.random() * 20) + 5,
    depleted: false,
    size: Math.random() * 10 + 20,
  }))
}

export function OceanMiningGame({
  walletConnected,
  gameState,
  setGameState,
  sidebarOpen,
  setSidebarOpen,
}: OceanMiningGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Player position and movement
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: 500, y: 500, rotation: 0 })
  const [movementKeys, setMovementKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })

  // Player stats and resources
  const [playerTier, setPlayerTier] = useState(1)
  const submarineData = getSubmarineByTier(playerTier)

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    ...submarineData.baseStats,
    capacity: {
      nickel: 0,
      cobalt: 0,
      copper: 0,
      manganese: 0,
    },
  })

  const [resources, setResources] = useState<PlayerResources>({
    nickel: 0,
    cobalt: 0,
    copper: 0,
    manganese: 0,
  })

  const [balance, setBalance] = useState(500)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [targetNode, setTargetNode] = useState<ResourceNode | null>(null)
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>(generateInitialNodes())
  const [showStorageAlert, setShowStorageAlert] = useState(false)
  const [storagePercentage, setStoragePercentage] = useState(0)
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })

  // Update storage percentage when resources change
  useEffect(() => {
    const percentage = getStoragePercentage(resources, playerStats)
    setStoragePercentage(percentage)

    // Show storage alert when almost full
    if (percentage >= 90 && percentage < 100) {
      setShowStorageAlert(true)
      setTimeout(() => setShowStorageAlert(false), 5000)
    }
  }, [resources, playerStats])

  // Handle keyboard input for submarine movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!walletConnected) return

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setMovementKeys((prev) => ({ ...prev, forward: true }))
          break
        case "s":
        case "arrowdown":
          setMovementKeys((prev) => ({ ...prev, backward: true }))
          break
        case "a":
        case "arrowleft":
          setMovementKeys((prev) => ({ ...prev, left: true }))
          break
        case "d":
        case "arrowright":
          setMovementKeys((prev) => ({ ...prev, right: true }))
          break
        case "f":
          if (targetNode) handleMine(targetNode)
          break
        case "u":
          setShowUpgradeModal(true)
          break
        case "i":
          setSidebarOpen((prev) => !prev)
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setMovementKeys((prev) => ({ ...prev, forward: false }))
          break
        case "s":
        case "arrowdown":
          setMovementKeys((prev) => ({ ...prev, backward: false }))
          break
        case "a":
        case "arrowleft":
          setMovementKeys((prev) => ({ ...prev, left: false }))
          break
        case "d":
        case "arrowright":
          setMovementKeys((prev) => ({ ...prev, right: false }))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [walletConnected, targetNode, setSidebarOpen])

  // Game loop
  useEffect(() => {
    if (!walletConnected) return

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Update player position based on movement keys
      if (gameState !== "mining") {
        updatePlayerPosition(deltaTime)
      }

      // Check for nearby resource nodes
      checkNearbyNodes()

      // Render the game
      renderGame()

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(gameLoopRef.current)
    }
  }, [walletConnected, playerPosition, movementKeys, gameState, resourceNodes, playerStats.speed])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Handle window resize
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const updatePlayerPosition = (deltaTime: number) => {
    const speed = playerStats.speed * 0.2 * (deltaTime / 16)
    let newX = playerPosition.x
    let newY = playerPosition.y
    let newRotation = playerPosition.rotation

    if (movementKeys.left) {
      newRotation -= 0.05
    }
    if (movementKeys.right) {
      newRotation += 0.05
    }
    if (movementKeys.forward) {
      newX += Math.cos(newRotation) * speed
      newY += Math.sin(newRotation) * speed
    }
    if (movementKeys.backward) {
      newX -= Math.cos(newRotation) * speed
      newY -= Math.sin(newRotation) * speed
    }

    // Limit movement area
    newX = Math.max(50, Math.min(1950, newX))
    newY = Math.max(50, Math.min(1950, newY))

    setPlayerPosition({ x: newX, y: newY, rotation: newRotation })

    // Update viewport offset to center on player
    const canvas = canvasRef.current
    if (canvas) {
      setViewportOffset({
        x: Math.max(0, Math.min(1000, newX - canvas.width / 2)),
        y: Math.max(0, Math.min(1000, newY - canvas.height / 2)),
      })
    }
  }

  const checkNearbyNodes = () => {
    const nearbyNode = resourceNodes.find((node) => {
      if (node.depleted) return false

      const dx = node.position.x - playerPosition.x
      const dy = node.position.y - playerPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      return distance < 80
    })

    setTargetNode(nearbyNode || null)
  }

  const renderGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0c4a6e"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#1e40af30"
    ctx.lineWidth = 1
    const gridSize = 100
    const offsetX = -viewportOffset.x % gridSize
    const offsetY = -viewportOffset.y % gridSize

    for (let x = offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw resource nodes
    resourceNodes.forEach((node) => {
      if (node.depleted) return

      const screenX = node.position.x - viewportOffset.x
      const screenY = node.position.y - viewportOffset.y

      // Only draw if within viewport
      if (screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
        // Draw glow
        const gradient = ctx.createRadialGradient(screenX, screenY, node.size / 2, screenX, screenY, node.size * 1.5)
        gradient.addColorStop(0, getResourceColor(node.type) + "80")
        gradient.addColorStop(1, getResourceColor(node.type) + "00")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(screenX, screenY, node.size * 1.5, 0, Math.PI * 2)
        ctx.fill()

        // Draw node
        ctx.fillStyle = getResourceColor(node.type)
        ctx.beginPath()
        ctx.arc(screenX, screenY, node.size, 0, Math.PI * 2)
        ctx.fill()

        // Draw outline if this is the target node
        if (targetNode && node.id === targetNode.id) {
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(screenX, screenY, node.size + 5, 0, Math.PI * 2)
          ctx.stroke()

          // Draw node info
          ctx.fillStyle = "#ffffff"
          ctx.font = "14px Arial"
          ctx.textAlign = "center"
          ctx.fillText(
            `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} (${node.amount})`,
            screenX,
            screenY - node.size - 10,
          )
        }
      }
    })

    // Draw other players
    mockOtherPlayers.forEach((player) => {
      const screenX = player.position.x - viewportOffset.x
      const screenY = player.position.y - viewportOffset.y

      // Only draw if within viewport
      if (screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
        drawSubmarine(ctx, screenX, screenY, player.rotation, getSubmarineByTier(player.submarineType).color)

        // Draw player name
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.username, screenX, screenY - 40)
      }
    })

    // Draw player submarine
    const screenX = playerPosition.x - viewportOffset.x
    const screenY = playerPosition.y - viewportOffset.y
    drawSubmarine(ctx, screenX, screenY, playerPosition.rotation, submarineData.color)

    // Draw bubbles if moving
    if (movementKeys.forward || movementKeys.backward) {
      for (let i = 0; i < 2; i++) {
        const bubbleX = screenX - Math.cos(playerPosition.rotation) * 30 + (Math.random() - 0.5) * 20
        const bubbleY = screenY - Math.sin(playerPosition.rotation) * 30 + (Math.random() - 0.5) * 20
        const bubbleSize = Math.random() * 5 + 2

        ctx.fillStyle = "#7dd3fc80"
        ctx.beginPath()
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const drawSubmarine = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, color: string) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)

    // Draw submarine body
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2)
    ctx.fill()

    // Draw submarine conning tower
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(0, -10, 10, 5, 0, 0, Math.PI)
    ctx.fill()

    // Draw viewport
    ctx.fillStyle = "#7dd3fc"
    ctx.beginPath()
    ctx.arc(15, 0, 5, 0, Math.PI * 2)
    ctx.fill()

    // Draw propeller
    ctx.fillStyle = "#475569"
    ctx.beginPath()
    ctx.ellipse(-25, 0, 5, 10, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const handleMine = (node: ResourceNode) => {
    if (!walletConnected || gameState !== "idle" || !targetNode) return

    setGameState("mining")

    // Check if player has enough storage
    const { canMine, amountToMine } = canMineResource(playerStats, resources, node.type, node.amount)

    if (!canMine) {
      setShowStorageAlert(true)
      setTimeout(() => {
        setShowStorageAlert(false)
        setGameState("idle")
      }, 2000)
      return
    }

    // Simulate mining process
    setTimeout(() => {
      // Update player resources
      setResources((prev) => ({
        ...prev,
        [node.type]: prev[node.type] + amountToMine,
      }))

      // Update player stats
      setPlayerStats((prev) => ({
        ...prev,
        energy: Math.max(prev.energy - 5, 0),
        capacity: {
          ...prev.capacity,
          [node.type]: prev.capacity[node.type] + amountToMine,
        },
      }))

      // Update resource node
      setResourceNodes((prev) =>
        prev.map((n) => {
          if (n.id === node.id) {
            const remainingAmount = n.amount - amountToMine
            return {
              ...n,
              amount: remainingAmount,
              depleted: remainingAmount <= 0,
            }
          }
          return n
        }),
      )

      setGameState("resourceGained")

      setTimeout(() => {
        setGameState("idle")
      }, 2000)
    }, 2000)
  }

  const handleTrade = (resourceType: keyof PlayerResources) => {
    if (resources[resourceType] <= 0) return

    setGameState("trading")

    setTimeout(() => {
      const value = Math.floor(Math.random() * 10) + 5

      setResources((prev) => ({
        ...prev,
        [resourceType]: prev[resourceType] - 1,
      }))

      setPlayerStats((prev) => ({
        ...prev,
        capacity: {
          ...prev.capacity,
          [resourceType]: prev.capacity[resourceType] - 1,
        },
      }))

      setBalance((prev) => prev + value)

      setGameState("resourceTraded")

      setTimeout(() => {
        setGameState("idle")
      }, 2000)
    }, 1500)
  }

  const handleUpgradeSubmarine = () => {
    if (playerTier >= 15) return

    setGameState("upgrading")

    setTimeout(() => {
      const nextTier = playerTier + 1
      const nextSubmarineData = getSubmarineByTier(nextTier)

      // Update player tier and stats
      setPlayerTier(nextTier)
      setPlayerStats({
        ...nextSubmarineData.baseStats,
        capacity: { ...playerStats.capacity },
      })

      setGameState("upgraded")

      setTimeout(() => {
        setShowUpgradeModal(false)
        setGameState("idle")
      }, 2000)
    }, 2000)
  }

  return (
    <div className="relative h-full w-full">
      {/* Game Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Player Stats HUD */}
        <PlayerHUD stats={playerStats} resources={resources} tier={playerTier} />

        {/* Sonar/Mini-map */}
        <SonarRadar
          playerPosition={playerPosition}
          resourceNodes={resourceNodes}
          otherPlayers={mockOtherPlayers}
          viewportOffset={viewportOffset}
        />

        {/* Wallet Info (when connected) */}
        {walletConnected && <WalletInfo balance={balance} />}

        {/* Resource Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="pointer-events-auto absolute right-4 top-16 z-50 rounded-lg bg-slate-800/80 p-2 text-cyan-400 backdrop-blur-sm transition-all hover:bg-slate-700/80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 8h14M5 12h14M5 16h14" />
          </svg>
        </button>

        {/* Upgrade Button */}
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="pointer-events-auto absolute right-4 top-28 z-50 rounded-lg bg-slate-800/80 p-2 text-cyan-400 backdrop-blur-sm transition-all hover:bg-slate-700/80"
          disabled={gameState !== "idle"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
            <circle cx="17" cy="7" r="5" />
          </svg>
        </button>

        {/* Resource Sidebar */}
        <ResourceSidebar
          isOpen={sidebarOpen}
          resources={resources}
          balance={balance}
          onTrade={handleTrade}
          gameState={gameState}
          playerStats={playerStats}
        />

        {/* Mine Button - only show when near a resource */}
        {targetNode && (
          <MineButton
            onClick={() => handleMine(targetNode)}
            disabled={!walletConnected || gameState !== "idle"}
            gameState={gameState}
            resourceType={targetNode.type}
            resourceAmount={targetNode.amount}
          />
        )}

        {/* Storage Full Alert */}
        {showStorageAlert && <StorageFullAlert percentage={storagePercentage} />}

        {/* Game State Notifications */}
        {gameState !== "idle" && (
          <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 transform rounded-lg bg-slate-900/80 px-6 py-3 text-lg font-bold text-cyan-400 backdrop-blur-sm">
            {gameState === "mining" && "Mining in progress..."}
            {gameState === "resourceGained" && "Resource acquired!"}
            {gameState === "trading" && "Trading resource..."}
            {gameState === "resourceTraded" && "Resource traded successfully!"}
            {gameState === "upgrading" && "Upgrading submarine..."}
            {gameState === "upgraded" && "Submarine upgraded successfully!"}
          </div>
        )}

        {/* Controls Help */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-slate-900/70 p-3 text-xs text-slate-300 backdrop-blur-sm">
          <h3 className="mb-1 font-bold text-cyan-400">CONTROLS</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>W/↑ - Forward</div>
            <div>S/↓ - Backward</div>
            <div>A/← - Turn Left</div>
            <div>D/→ - Turn Right</div>
            <div>F - Mine (when near resource)</div>
            <div>U - Upgrade Menu</div>
            <div>I - Inventory</div>
          </div>
        </div>

        {/* No Wallet Connected Overlay */}
        {!walletConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="rounded-xl bg-slate-800/90 p-8 text-center text-white shadow-2xl">
              <h2 className="mb-4 text-2xl font-bold text-cyan-400">Connect Wallet to Play</h2>
              <p className="mb-6 text-slate-300">
                Connect your Web3 wallet to start mining resources from the ocean floor.
              </p>
              <button
                onClick={() => {}}
                className="pointer-events-auto rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-900/30 transition-all hover:shadow-cyan-900/50"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          currentTier={playerTier}
          resources={resources}
          balance={balance}
          onUpgrade={handleUpgradeSubmarine}
          onClose={() => setShowUpgradeModal(false)}
          gameState={gameState}
        />
      )}
    </div>
  )
}
