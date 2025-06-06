"use client"

import { useState, useEffect, useRef } from "react"
import { PlayerHUD } from "./player-hud"
import { SonarRadar } from "./sonar-radar"
import { MineButton } from "./mine-button"
import { UpgradeModal } from "./upgrade-modal"
import { WalletInfo } from "./wallet-info"
import { StorageFullAlert } from "./storage-full-alert"
import { getSubmarineByTier } from "@/lib/submarine-tiers"
import { canMineResource, getStoragePercentage, getResourceColor } from "@/lib/resource-utils"
import type { ResourceNode, OtherPlayer, PlayerPosition, OceanMiningGameProps } from "@/lib/types"
import { LowEnergyAlert } from "./low-energy-alert"

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
  selectedSubmarine,
  purchasedSubmarines,
  onSelectSubmarine,
  playerStats,
  resources,
  setResources,
  setPlayerStats,
  balance,
  setBalance,
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
          setMovementKeys((prev) => ({ ...prev, right: false }))
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

      // Energy regeneration - higher tier submarines regenerate faster
      if (playerStats.energy < getSubmarineByTier(selectedSubmarine).baseStats.energy) {
        const regenRate = selectedSubmarine * 0.5 // 0.5 energy per second per tier
        const energyRegen = (regenRate * deltaTime) / 1000

        setPlayerStats((prev) => ({
          ...prev,
          energy: Math.min(getSubmarineByTier(selectedSubmarine).baseStats.energy, prev.energy + energyRegen),
        }))
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
  }, [walletConnected, playerPosition, movementKeys, gameState, resourceNodes, playerStats.speed, selectedSubmarine])

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
    // Use the current submarine's speed from playerStats
    const speed = playerStats.speed * 0.2 * (deltaTime / 16)
    let newX = playerPosition.x
    let newY = playerPosition.y
    let newRotation = playerPosition.rotation

    // Track if player is moving for energy consumption
    let isMoving = false

    if (movementKeys.left) {
      newRotation -= 0.05
    }
    if (movementKeys.right) {
      newRotation += 0.05
    }
    if (movementKeys.forward) {
      newX += Math.cos(newRotation) * speed
      newY += Math.sin(newRotation) * speed
      isMoving = true
    }
    if (movementKeys.backward) {
      newX -= Math.cos(newRotation) * speed
      newY -= Math.sin(newRotation) * speed
      isMoving = true
    }

    // Consume energy for movement based on submarine efficiency
    if (isMoving && playerStats.energy > 0) {
      // Higher tier submarines are more energy efficient
      // Base energy consumption: 0.5 per second, reduced by tier efficiency
      const baseConsumption = 0.5
      const efficiencyMultiplier = Math.max(0.3, 1 - (selectedSubmarine - 1) * 0.05) // 5% more efficient per tier
      const energyConsumption = (baseConsumption * efficiencyMultiplier * deltaTime) / 1000

      setPlayerStats((prev) => ({
        ...prev,
        energy: Math.max(0, prev.energy - energyConsumption),
      }))
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

    // Draw player submarine with current submarine color
    const screenX = playerPosition.x - viewportOffset.x
    const screenY = playerPosition.y - viewportOffset.y
    const submarineData = getSubmarineByTier(selectedSubmarine)
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

    // Check if player has enough energy to mine
    const submarineData = getSubmarineByTier(selectedSubmarine)
    const baseMiningEnergyCost = 15
    const efficiencyMultiplier = Math.max(0.4, 1 - (selectedSubmarine - 1) * 0.04) // 4% more efficient per tier
    const miningEnergyCost = baseMiningEnergyCost * efficiencyMultiplier

    if (playerStats.energy < miningEnergyCost) {
      // Show low energy alert
      setGameState("idle")
      // You could add a low energy alert here
      return
    }

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

    // Use the current submarine's mining rate
    const miningTime = Math.max(500, 2000 / playerStats.miningRate)

    // Simulate mining process
    setTimeout(() => {
      // Update player resources
      setResources((prev) => ({
        ...prev,
        [node.type]: prev[node.type] + amountToMine,
      }))

      // Update player stats with energy consumption
      setPlayerStats((prev) => ({
        ...prev,
        energy: Math.max(prev.energy - miningEnergyCost, 0),
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
    }, miningTime)
  }

  return (
    <div className="relative h-full w-full">
      {/* Game Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Player Stats HUD */}
        <PlayerHUD stats={playerStats} resources={resources} tier={selectedSubmarine} />

        {/* Sonar/Mini-map */}
        <SonarRadar
          playerPosition={playerPosition}
          resourceNodes={resourceNodes}
          otherPlayers={mockOtherPlayers}
          viewportOffset={viewportOffset}
        />

        {/* Wallet Info (when connected) */}
        {walletConnected && <WalletInfo balance={balance} />}

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

        {/* Low Energy Alert */}
        <LowEnergyAlert energyLevel={playerStats.energy} />

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
        <div className="absolute bottom-4 left-4 rounded-lg bg-slate-900/70 p-3 text-xs text-slate-300 backdrop-blur-sm">
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
          currentTier={selectedSubmarine}
          resources={resources}
          balance={balance}
          onUpgrade={() => {}}
          onClose={() => setShowUpgradeModal(false)}
          gameState={gameState}
          purchasedSubmarines={purchasedSubmarines}
          onSelectSubmarine={onSelectSubmarine}
          selectedSubmarine={selectedSubmarine}
        />
      )}
    </div>
  )
}
