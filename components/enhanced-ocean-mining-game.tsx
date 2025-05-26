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
import { createExplosion, createBubbleTrail, type Particle } from "@/lib/particle-effects"
import type { GameState, ResourceNode, PlayerStats, PlayerResources, OtherPlayer, PlayerPosition } from "@/lib/types"

interface EnhancedOceanMiningGameProps {
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

// Generate initial resource nodes with more variety
const generateInitialNodes = (): ResourceNode[] => {
  const types = ["nickel", "cobalt", "copper", "manganese"] as const
  return Array.from({ length: 40 }, (_, i) => ({
    id: `node-${i}`,
    position: { x: Math.random() * 1800 + 100, y: Math.random() * 1800 + 100 },
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.floor(Math.random() * 20) + 5,
    depleted: false,
    size: Math.random() * 15 + 15,
    pulseSpeed: Math.random() * 2 + 1,
    pulsePhase: Math.random() * Math.PI * 2,
  }))
}

// Generate sea creatures for ambient life
const generateSeaCreatures = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `creature-${i}`,
    position: {
      x: Math.random() * 2000,
      y: Math.random() * 2000,
    },
    velocity: {
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
    },
    size: Math.random() * 10 + 5,
    type: Math.floor(Math.random() * 3), // 0: fish, 1: jellyfish, 2: crab
    color: `hsl(${Math.random() * 60 + 180}, 70%, 60%)`,
    rotation: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.5 + 0.2,
    wobble: Math.random() * 0.1,
    wobbleSpeed: Math.random() * 0.05 + 0.02,
    wobblePhase: Math.random() * Math.PI * 2,
  }))
}

// Generate underwater plants for decoration
const generateUnderwaterPlants = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `plant-${i}`,
    position: {
      x: Math.random() * 2000,
      y: Math.random() * 2000,
    },
    size: Math.random() * 30 + 20,
    type: Math.floor(Math.random() * 3), // 0: seaweed, 1: coral, 2: anemone
    color:
      Math.random() > 0.5
        ? `hsl(${Math.random() * 40 + 140}, 70%, 40%)`
        : // greens
          `hsl(${Math.random() * 60 + 300}, 70%, 50%)`, // purples/pinks
    swaySpeed: Math.random() * 0.02 + 0.01,
    swayPhase: Math.random() * Math.PI * 2,
    swayAmount: Math.random() * 0.2 + 0.1,
  }))
}

export function EnhancedOceanMiningGame({
  walletConnected,
  gameState,
  setGameState,
  sidebarOpen,
  setSidebarOpen,
}: EnhancedOceanMiningGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef<number>(0)

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
  const [seaCreatures, setSeaCreatures] = useState(generateSeaCreatures(20))
  const [underwaterPlants, setUnderwaterPlants] = useState(generateUnderwaterPlants(30))
  const [showStorageAlert, setShowStorageAlert] = useState(false)
  const [storagePercentage, setStoragePercentage] = useState(0)
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })
  const [miningParticles, setMiningParticles] = useState<Particle[]>([])
  const [bubbleTrail, setBubbleTrail] = useState<Particle[]>([])
  const [depthColor, setDepthColor] = useState("#0c4a6e")
  const [lightRadius, setLightRadius] = useState(300)
  const [showTutorial, setShowTutorial] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState("")

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
        case "escape":
          setShowTutorial(false)
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
      timeRef.current += deltaTime

      // Update player position based on movement keys
      if (gameState !== "mining") {
        updatePlayerPosition(deltaTime)
      }

      // Update sea creatures
      updateSeaCreatures(deltaTime)

      // Check for nearby resource nodes
      checkNearbyNodes()

      // Update particles
      updateParticles(deltaTime)

      // Render the game
      renderGame()

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(gameLoopRef.current)
    }
  }, [walletConnected, playerPosition, movementKeys, gameState, resourceNodes, playerStats.speed, seaCreatures])

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

  // Tutorial steps
  useEffect(() => {
    if (!showTutorial) return

    const tutorialSteps = [
      "Welcome to Deep Sea Mining! Use WASD or arrow keys to navigate your submarine.",
      "Approach mineral nodes to mine them with the F key when prompted.",
      "Upgrade your submarine with the U key to increase storage and mining efficiency.",
      "Open your inventory with the I key to view and trade your resources.",
      "Watch your energy levels and storage capacity in the HUD.",
      "Press ESC to close this tutorial at any time. Good luck, captain!",
    ]

    if (tutorialStep < tutorialSteps.length) {
      const timer = setTimeout(() => {
        setTutorialStep((prev) => prev + 1)
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setShowTutorial(false)
    }
  }, [tutorialStep, showTutorial])

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

      // Add bubble trail when moving forward
      if (Math.random() > 0.7) {
        const newBubbles = createBubbleTrail(
          newX - Math.cos(newRotation) * 30,
          newY - Math.sin(newRotation) * 30,
          3,
          "#7dd3fc",
        )
        setBubbleTrail((prev) => [...prev, ...newBubbles])
      }
    }
    if (movementKeys.backward) {
      newX -= Math.cos(newRotation) * speed * 0.7 // Slower backward movement
      newY -= Math.sin(newRotation) * speed * 0.7
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

    // Update depth color based on position (deeper = darker blue)
    const depthFactor = Math.min(1, Math.max(0, newY / 1500))
    const r = Math.floor(12 - depthFactor * 8)
    const g = Math.floor(74 - depthFactor * 50)
    const b = Math.floor(110 - depthFactor * 40)
    setDepthColor(`rgb(${r}, ${g}, ${b})`)

    // Update light radius based on depth (deeper = smaller light radius)
    setLightRadius(300 - depthFactor * 100)
  }

  const updateSeaCreatures = (deltaTime: number) => {
    setSeaCreatures((prev) =>
      prev.map((creature) => {
        // Update position based on velocity
        let newX = creature.position.x + creature.velocity.x * creature.speed * deltaTime
        let newY = creature.position.y + creature.velocity.y * creature.speed * deltaTime

        // Occasionally change direction
        if (Math.random() < 0.005) {
          const angle = Math.random() * Math.PI * 2
          return {
            ...creature,
            position: { x: newX, y: newY },
            velocity: {
              x: Math.cos(angle) * creature.speed,
              y: Math.sin(angle) * creature.speed,
            },
            rotation: angle,
          }
        }

        // Boundary check
        if (newX < 0 || newX > 2000) {
          creature.velocity.x *= -1
          newX = creature.position.x
        }
        if (newY < 0 || newY > 2000) {
          creature.velocity.y *= -1
          newY = creature.position.y
        }

        // Update wobble phase
        const newWobblePhase = (creature.wobblePhase + creature.wobbleSpeed * deltaTime) % (Math.PI * 2)

        return {
          ...creature,
          position: { x: newX, y: newY },
          wobblePhase: newWobblePhase,
          rotation: Math.atan2(creature.velocity.y, creature.velocity.x),
        }
      }),
    )
  }

  const checkNearbyNodes = () => {
    const nearbyNode = resourceNodes.find((node) => {
      if (node.depleted) return false

      const dx = node.position.x - playerPosition.x
      const dy = node.position.y - playerPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      return distance < 80
    })

    // If we found a new target node, show notification
    if (nearbyNode && (!targetNode || nearbyNode.id !== targetNode.id)) {
      setNotification(`${nearbyNode.type.toUpperCase()} node detected!`)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 2000)
    }

    setTargetNode(nearbyNode || null)
  }

  const updateParticles = (deltaTime: number) => {
    // Update mining particles
    setMiningParticles((prev) =>
      prev
        .map((particle) => {
          particle.x += particle.vx * (deltaTime / 16)
          particle.y += particle.vy * (deltaTime / 16)
          particle.life -= deltaTime
          particle.opacity = particle.life / particle.maxLife
          return particle
        })
        .filter((particle) => particle.life > 0),
    )

    // Update bubble trail
    setBubbleTrail((prev) =>
      prev
        .map((bubble) => {
          bubble.x += bubble.vx * (deltaTime / 16)
          bubble.y += bubble.vy * (deltaTime / 16)
          bubble.life -= deltaTime
          bubble.opacity = bubble.life / bubble.maxLife
          return bubble
        })
        .filter((bubble) => bubble.life > 0),
    )
  }

  const renderGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with depth-based color
    ctx.fillStyle = depthColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw caustics (light patterns)
    drawCaustics(ctx)

    // Draw underwater plants
    drawUnderwaterPlants(ctx)

    // Draw grid
    ctx.strokeStyle = "#1e40af20"
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
        // Calculate pulse effect
        const pulseSize = Math.sin(timeRef.current * 0.001 * node.pulseSpeed + node.pulsePhase) * 0.2 + 1

        // Draw glow
        const gradient = ctx.createRadialGradient(
          screenX,
          screenY,
          (node.size / 2) * pulseSize,
          screenX,
          screenY,
          node.size * 2 * pulseSize,
        )
        gradient.addColorStop(0, getResourceColor(node.type) + "80")
        gradient.addColorStop(1, getResourceColor(node.type) + "00")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(screenX, screenY, node.size * 2 * pulseSize, 0, Math.PI * 2)
        ctx.fill()

        // Draw node with crystalline shape
        const points = 5 + Math.floor(node.size / 5)
        const innerRadius = node.size * 0.6 * pulseSize
        const outerRadius = node.size * pulseSize

        ctx.fillStyle = getResourceColor(node.type)
        ctx.beginPath()

        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (i / (points * 2)) * Math.PI * 2
          const x = screenX + Math.cos(angle) * radius
          const y = screenY + Math.sin(angle) * radius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.closePath()
        ctx.fill()

        // Add inner glow
        const innerGlow = ctx.createRadialGradient(screenX, screenY, innerRadius * 0.2, screenX, screenY, innerRadius)
        innerGlow.addColorStop(0, "#ffffff80")
        innerGlow.addColorStop(1, getResourceColor(node.type) + "00")

        ctx.fillStyle = innerGlow
        ctx.beginPath()
        ctx.arc(screenX, screenY, innerRadius, 0, Math.PI * 2)
        ctx.fill()

        // Draw outline if this is the target node
        if (targetNode && node.id === targetNode.id) {
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.arc(screenX, screenY, node.size + 15, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])

          // Draw node info with better styling
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 16px Arial"
          ctx.textAlign = "center"
          ctx.fillText(`${node.type.toUpperCase()}`, screenX, screenY - node.size - 25)

          ctx.font = "14px Arial"
          ctx.fillText(`Amount: ${node.amount}`, screenX, screenY - node.size - 5)

          // Draw mining indicator
          if (gameState === "mining" && targetNode.id === node.id) {
            const miningProgress = (timeRef.current % 2000) / 2000

            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.arc(screenX, screenY, node.size + 25, 0, Math.PI * 2 * miningProgress)
            ctx.stroke()
          }
        }
      }
    })

    // Draw sea creatures
    drawSeaCreatures(ctx)

    // Draw other players
    mockOtherPlayers.forEach((player) => {
      const screenX = player.position.x - viewportOffset.x
      const screenY = player.position.y - viewportOffset.y

      // Only draw if within viewport
      if (screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
        drawEnhancedSubmarine(
          ctx,
          screenX,
          screenY,
          player.rotation,
          getSubmarineByTier(player.submarineType).color,
          player.submarineType,
        )

        // Draw player name with better styling
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.fillRect(screenX - 60, screenY - 55, 120, 25)

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.username, screenX, screenY - 40)
      }
    })

    // Draw player submarine with light effect
    const screenX = playerPosition.x - viewportOffset.x
    const screenY = playerPosition.y - viewportOffset.y

    // Draw player light
    const lightGradient = ctx.createRadialGradient(screenX, screenY, 10, screenX, screenY, lightRadius)
    lightGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
    lightGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

    ctx.fillStyle = lightGradient
    ctx.beginPath()
    ctx.arc(screenX, screenY, lightRadius, 0, Math.PI * 2)
    ctx.fill()

    // Draw spotlight in direction of movement
    const spotlightX = screenX + Math.cos(playerPosition.rotation) * 100
    const spotlightY = screenY + Math.sin(playerPosition.rotation) * 100

    const spotlightGradient = ctx.createRadialGradient(spotlightX, spotlightY, 10, spotlightX, spotlightY, 150)
    spotlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)")
    spotlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

    ctx.fillStyle = spotlightGradient
    ctx.beginPath()
    ctx.arc(spotlightX, spotlightY, 150, 0, Math.PI * 2)
    ctx.fill()

    // Draw the submarine
    drawEnhancedSubmarine(ctx, screenX, screenY, playerPosition.rotation, submarineData.color, playerTier)

    // Draw particles
    drawParticles(ctx)
  }

  const drawCaustics = (ctx: CanvasRenderingContext2D) => {
    const time = timeRef.current * 0.001
    const canvas = canvasRef.current
    if (!canvas) return

    ctx.save()
    ctx.globalAlpha = 0.1

    for (let i = 0; i < 3; i++) {
      const offsetX = Math.sin(time * 0.5 + i) * 100
      const offsetY = Math.cos(time * 0.3 + i) * 100

      for (let x = -200; x < canvas.width + 200; x += 200) {
        for (let y = -200; y < canvas.height + 200; y += 200) {
          const posX = x + offsetX - viewportOffset.x * 0.1
          const posY = y + offsetY - viewportOffset.y * 0.1

          ctx.beginPath()
          ctx.arc(posX, posY, 100, 0, Math.PI * 2)
          ctx.fillStyle = "#ffffff"
          ctx.fill()
        }
      }
    }

    ctx.restore()
  }

  const drawUnderwaterPlants = (ctx: CanvasRenderingContext2D) => {
    underwaterPlants.forEach((plant) => {
      const screenX = plant.position.x - viewportOffset.x
      const screenY = plant.position.y - viewportOffset.y

      // Only draw if within viewport
      if (screenX > -50 && screenX < ctx.canvas.width + 50 && screenY > -50 && screenY < ctx.canvas.height + 50) {
        const swayOffset = Math.sin(timeRef.current * 0.001 * plant.swaySpeed + plant.swayPhase) * plant.swayAmount

        ctx.save()
        ctx.translate(screenX, screenY)

        switch (plant.type) {
          case 0: // Seaweed
            drawSeaweed(ctx, plant.size, plant.color, swayOffset)
            break
          case 1: // Coral
            drawCoral(ctx, plant.size, plant.color)
            break
          case 2: // Anemone
            drawAnemone(ctx, plant.size, plant.color, swayOffset)
            break
        }

        ctx.restore()
      }
    })
  }

  const drawSeaweed = (ctx: CanvasRenderingContext2D, size: number, color: string, swayOffset: number) => {
    const segments = 5 + Math.floor(size / 10)
    const segmentHeight = size / segments

    for (let i = 0; i < segments; i++) {
      const segmentOffset = swayOffset * (i / segments) * 2
      const segmentWidth = Math.max(2, (size / 10) * (1 - i / segments))

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(segmentOffset, -size + i * segmentHeight, segmentWidth, segmentHeight / 2, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawCoral = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    const branches = 3 + Math.floor(Math.random() * 3)

    for (let i = 0; i < branches; i++) {
      const angle = (i / branches) * Math.PI * 2
      const length = size * (0.5 + Math.random() * 0.5)

      ctx.save()
      ctx.rotate(angle)

      // Draw branch
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(-size / 10, 0)
      ctx.lineTo(size / 10, 0)
      ctx.lineTo(size / 5, -length)
      ctx.lineTo(-size / 5, -length)
      ctx.closePath()
      ctx.fill()

      // Draw bulb at end
      ctx.beginPath()
      ctx.arc(0, -length, size / 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }
  }

  const drawAnemone = (ctx: CanvasRenderingContext2D, size: number, color: string, swayOffset: number) => {
    const tentacles = 8 + Math.floor(Math.random() * 5)

    // Draw base
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(0, 0, size / 3, size / 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Draw tentacles
    for (let i = 0; i < tentacles; i++) {
      const angle = (i / tentacles) * Math.PI * 2
      const tentacleLength = size * (0.7 + Math.random() * 0.3)
      const tentacleSwayOffset = swayOffset * Math.sin(angle * 2)

      ctx.save()
      ctx.rotate(angle)

      ctx.beginPath()
      ctx.moveTo(0, 0)

      // Create curved tentacle
      for (let j = 0; j < 5; j++) {
        const segmentLength = tentacleLength / 5
        const segmentOffset = tentacleSwayOffset * (j / 4) * 2

        ctx.quadraticCurveTo(segmentOffset * 2, -segmentLength * (j + 0.5), segmentOffset, -segmentLength * (j + 1))
      }

      ctx.lineWidth = Math.max(1, size / 15)
      ctx.strokeStyle = color
      ctx.stroke()

      // Draw small bulb at end
      ctx.beginPath()
      ctx.arc(tentacleSwayOffset, -tentacleLength, size / 20, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      ctx.restore()
    }
  }

  const drawSeaCreatures = (ctx: CanvasRenderingContext2D) => {
    seaCreatures.forEach((creature) => {
      const screenX = creature.position.x - viewportOffset.x
      const screenY = creature.position.y - viewportOffset.y

      // Only draw if within viewport
      if (screenX > -50 && screenX < ctx.canvas.width + 50 && screenY > -50 && screenY < ctx.canvas.height + 50) {
        ctx.save()
        ctx.translate(screenX, screenY)
        ctx.rotate(creature.rotation)

        const wobbleOffset = Math.sin(creature.wobblePhase) * creature.wobble * creature.size

        switch (creature.type) {
          case 0: // Fish
            drawFish(ctx, creature.size, creature.color, wobbleOffset)
            break
          case 1: // Jellyfish
            drawJellyfish(ctx, creature.size, creature.color, wobbleOffset)
            break
          case 2: // Crab
            drawCrab(ctx, creature.size, creature.color, wobbleOffset)
            break
        }

        ctx.restore()
      }
    })
  }

  const drawFish = (ctx: CanvasRenderingContext2D, size: number, color: string, wobbleOffset: number) => {
    // Body
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Tail
    ctx.beginPath()
    ctx.moveTo(-size, -size / 2 + wobbleOffset)
    ctx.lineTo(-size * 1.5, 0)
    ctx.lineTo(-size, size / 2 + wobbleOffset)
    ctx.closePath()
    ctx.fill()

    // Eye
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(size / 2, -size / 6, size / 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(size / 2, -size / 6, size / 10, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawJellyfish = (ctx: CanvasRenderingContext2D, size: number, color: string, wobbleOffset: number) => {
    // Bell
    ctx.fillStyle = color
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.arc(0, 0, size, 0, Math.PI)
    ctx.quadraticCurveTo(size / 2, size / 2, 0, size / 2)
    ctx.quadraticCurveTo(-size / 2, size / 2, -size, 0)
    ctx.closePath()
    ctx.fill()

    // Tentacles
    ctx.globalAlpha = 0.5
    for (let i = 0; i < 8; i++) {
      const tentacleX = -size + (i * size) / 4
      const tentacleLength = size + (Math.random() * size) / 2

      ctx.beginPath()
      ctx.moveTo(tentacleX, size / 2)

      // Wavy tentacle
      for (let j = 0; j < 4; j++) {
        const segmentY = size / 2 + ((j + 1) * tentacleLength) / 4
        const segmentX = tentacleX + (Math.sin(wobbleOffset + j) * size) / 4

        ctx.quadraticCurveTo(segmentX + size / 8, size / 2 + ((j + 0.5) * tentacleLength) / 4, segmentX, segmentY)
      }

      ctx.lineWidth = Math.max(1, size / 10)
      ctx.strokeStyle = color
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  const drawCrab = (ctx: CanvasRenderingContext2D, size: number, color: string, wobbleOffset: number) => {
    // Body
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Eyes
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(size / 3, -size / 4, size / 8, 0, Math.PI * 2)
    ctx.arc(-size / 3, -size / 4, size / 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(size / 3, -size / 4, size / 16, 0, Math.PI * 2)
    ctx.arc(-size / 3, -size / 4, size / 16, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, size / 8)

    for (let i = 0; i < 3; i++) {
      const legAngle = Math.PI / 6 + (i * Math.PI) / 8
      const legLength = size * 0.8

      // Left leg
      ctx.beginPath()
      ctx.moveTo((-size / 2) * Math.cos(legAngle), (-size / 2) * Math.sin(legAngle))
      ctx.quadraticCurveTo(
        -size * Math.cos(legAngle) - wobbleOffset,
        -size / 2,
        -legLength * Math.cos(legAngle),
        -size / 4 + (i * size) / 3,
      )
      ctx.stroke()

      // Right leg
      ctx.beginPath()
      ctx.moveTo((size / 2) * Math.cos(legAngle), (-size / 2) * Math.sin(legAngle))
      ctx.quadraticCurveTo(
        size * Math.cos(legAngle) + wobbleOffset,
        -size / 2,
        legLength * Math.cos(legAngle),
        -size / 4 + (i * size) / 3,
      )
      ctx.stroke()
    }

    // Claws
    ctx.fillStyle = color

    // Left claw
    ctx.beginPath()
    ctx.ellipse(-size, 0, size / 3, size / 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Right claw
    ctx.beginPath()
    ctx.ellipse(size, 0, size / 3, size / 5, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawEnhancedSubmarine = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    color: string,
    tier: number,
  ) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)

    // Draw propeller wake
    if (tier >= 3) {
      ctx.fillStyle = "#7dd3fc30"
      ctx.beginPath()
      ctx.moveTo(-40, 0)
      ctx.lineTo(-80, -20)
      ctx.lineTo(-80, 20)
      ctx.closePath()
      ctx.fill()
    }

    // Draw submarine body with gradient
    const bodyGradient = ctx.createLinearGradient(0, -15, 0, 15)
    bodyGradient.addColorStop(0, color)
    bodyGradient.addColorStop(1, adjustColor(color, -30))

    ctx.fillStyle = bodyGradient
    ctx.beginPath()
    ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2)
    ctx.fill()

    // Draw outline
    ctx.strokeStyle = "#00000030"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw submarine conning tower with gradient
    const towerGradient = ctx.createLinearGradient(0, -15, 0, -5)
    towerGradient.addColorStop(0, adjustColor(color, 20))
    towerGradient.addColorStop(1, color)

    ctx.fillStyle = towerGradient
    ctx.beginPath()
    ctx.ellipse(0, -10, 10, 5, 0, 0, Math.PI)
    ctx.fill()
    ctx.stroke()

    // Draw viewport with glow
    const viewportGradient = ctx.createRadialGradient(15, 0, 1, 15, 0, 6)
    viewportGradient.addColorStop(0, "#ffffff")
    viewportGradient.addColorStop(0.5, "#7dd3fc")
    viewportGradient.addColorStop(1, "#0ea5e9")

    ctx.fillStyle = viewportGradient
    ctx.beginPath()
    ctx.arc(15, 0, 5, 0, Math.PI * 2)
    ctx.fill()

    // Add viewport reflection
    ctx.fillStyle = "#ffffff80"
    ctx.beginPath()
    ctx.ellipse(14, -1, 2, 1, Math.PI / 4, 0, Math.PI * 2)
    ctx.fill()

    // Draw propeller with animation
    const propellerAngle = (timeRef.current * 0.01) % (Math.PI * 2)

    ctx.fillStyle = "#475569"
    ctx.beginPath()
    ctx.ellipse(-25, 0, 5, 10, propellerAngle, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Draw propeller hub
    ctx.fillStyle = "#334155"
    ctx.beginPath()
    ctx.arc(-25, 0, 3, 0, Math.PI * 2)
    ctx.fill()

    // Draw tier-specific decorations
    if (tier >= 3) {
      // Fins
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(0, -15)
      ctx.lineTo(10, -25)
      ctx.lineTo(-10, -25)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    if (tier >= 5) {
      // Side thrusters
      ctx.fillStyle = "#475569"
      ctx.beginPath()
      ctx.roundRect(-5, -20, 10, 5, 2)
      ctx.fill()
      ctx.stroke()

      // Thruster glow
      if (Math.random() > 0.7) {
        ctx.fillStyle = "#0ea5e980"
        ctx.beginPath()
        ctx.ellipse(0, -20, 3, 1, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (tier >= 7) {
      // Advanced lighting
      ctx.fillStyle = "#0ea5e930"
      ctx.beginPath()
      ctx.arc(25, 0, 10, 0, Math.PI * 2)
      ctx.fill()

      // Hull reinforcements
      ctx.strokeStyle = adjustColor(color, -20)
      ctx.lineWidth = 2
      for (let i = -20; i <= 20; i += 10) {
        ctx.beginPath()
        ctx.arc(0, 0, 30, Math.PI / 2 + Math.PI / 12, (Math.PI * 3) / 2 - Math.PI / 12)
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    // Draw mining particles
    miningParticles.forEach((particle) => {
      const screenX = particle.x - viewportOffset.x
      const screenY = particle.y - viewportOffset.y

      ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.opacity})`
      ctx.beginPath()
      ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw bubble trail
    bubbleTrail.forEach((bubble) => {
      const screenX = bubble.x - viewportOffset.x
      const screenY = bubble.y - viewportOffset.y

      ctx.fillStyle = `rgba(125, 211, 252, ${bubble.opacity * 0.5})`
      ctx.strokeStyle = `rgba(125, 211, 252, ${bubble.opacity * 0.8})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(screenX, screenY, bubble.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })
  }

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    // Parse hex color
    if (color.startsWith("#") && color.length === 7) {
      let r = Number.parseInt(color.slice(1, 3), 16)
      let g = Number.parseInt(color.slice(3, 5), 16)
      let b = Number.parseInt(color.slice(5, 7), 16)

      r = Math.max(0, Math.min(255, r + amount))
      g = Math.max(0, Math.min(255, g + amount))
      b = Math.max(0, Math.min(255, b + amount))

      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    }

    return color
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

    // Create mining particles
    const newParticles = createExplosion(node.position.x, node.position.y, 20, getResourceColor(node.type))
    setMiningParticles((prev) => [...prev, ...newParticles])

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

      // Create more particles for resource gain
      const gainParticles = createExplosion(playerPosition.x, playerPosition.y, 30, getResourceColor(node.type))
      setMiningParticles((prev) => [...prev, ...gainParticles])

      setGameState("resourceGained")
      setNotification(`+${amountToMine} ${node.type.toUpperCase()} acquired!`)
      setShowNotification(true)

      setTimeout(() => {
        setShowNotification(false)
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

      // Create particles for trade
      const tradeParticles = createExplosion(
        playerPosition.x,
        playerPosition.y,
        15,
        "#fbbf24", // Gold color for money
      )
      setMiningParticles((prev) => [...prev, ...tradeParticles])

      setGameState("resourceTraded")
      setNotification(`Traded 1 ${resourceType.toUpperCase()} for ${value} OCE!`)
      setShowNotification(true)

      setTimeout(() => {
        setShowNotification(false)
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

      // Create upgrade particles
      const upgradeParticles = createExplosion(
        playerPosition.x,
        playerPosition.y,
        50,
        "#7c3aed", // Purple for upgrades
      )
      setMiningParticles((prev) => [...prev, ...upgradeParticles])

      setGameState("upgraded")
      setNotification(`Submarine upgraded to Tier ${nextTier}!`)
      setShowNotification(true)

      setTimeout(() => {
        setShowNotification(false)
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
          className="pointer-events-auto absolute right-4 top-16 z-50 rounded-lg bg-slate-800/80 p-2 text-cyan-400 backdrop-blur-sm transition-all hover:bg-slate-700/80 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-900/30"
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
          className="pointer-events-auto absolute right-4 top-28 z-50 rounded-lg bg-slate-800/80 p-2 text-cyan-400 backdrop-blur-sm transition-all hover:bg-slate-700/80 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-900/30"
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

        {/* Notification */}
        {showNotification && (
          <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 transform rounded-lg bg-slate-900/80 px-6 py-3 text-lg font-bold text-cyan-400 backdrop-blur-sm animate-bounce">
            {notification}
          </div>
        )}

        {/* Game State Notifications */}
        {gameState !== "idle" && (
          <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 transform rounded-lg bg-slate-900/80 px-6 py-3 text-lg font-bold text-cyan-400 backdrop-blur-sm">
            {gameState === "mining" && (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Mining in progress...
              </div>
            )}
            {gameState === "resourceGained" && "Resource acquired!"}
            {gameState === "trading" && (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Trading resource...
              </div>
            )}
            {gameState === "resourceTraded" && "Resource traded successfully!"}
            {gameState === "upgrading" && (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Upgrading submarine...
              </div>
            )}
            {gameState === "upgraded" && "Submarine upgraded successfully!"}
          </div>
        )}

        {/* Controls Help */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-slate-900/70 p-3 text-xs text-slate-300 backdrop-blur-sm border border-slate-700">
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

        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
            <div className="max-w-md rounded-xl bg-slate-800/90 p-8 text-center text-white shadow-2xl border-2 border-cyan-600">
              <h2 className="mb-4 text-2xl font-bold text-cyan-400">Deep Sea Mining Tutorial</h2>
              <p className="mb-6 text-slate-300">
                {tutorialStep === 0 && "Welcome to Deep Sea Mining! Use WASD or arrow keys to navigate your submarine."}
                {tutorialStep === 1 && "Approach mineral nodes to mine them with the F key when prompted."}
                {tutorialStep === 2 &&
                  "Upgrade your submarine with the U key to increase storage and mining efficiency."}
                {tutorialStep === 3 && "Open your inventory with the I key to view and trade your resources."}
                {tutorialStep === 4 && "Watch your energy levels and storage capacity in the HUD."}
                {tutorialStep === 5 && "Press ESC to close this tutorial at any time. Good luck, captain!"}
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="pointer-events-auto rounded-lg bg-slate-700 px-4 py-2 font-medium text-white transition-all hover:bg-slate-600"
                >
                  Skip Tutorial
                </button>
                <button
                  onClick={() => (tutorialStep < 5 ? setTutorialStep((prev) => prev + 1) : setShowTutorial(false))}
                  className="pointer-events-auto rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 font-medium text-white shadow-lg shadow-cyan-900/30 transition-all hover:shadow-cyan-900/50"
                >
                  {tutorialStep < 5 ? "Next" : "Start Mining"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Wallet Connected Overlay */}
        {!walletConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
            <div className="rounded-xl bg-slate-800/90 p-8 text-center text-white shadow-2xl border-2 border-cyan-600">
              <h2 className="mb-4 text-2xl font-bold text-cyan-400">Connect Wallet to Play</h2>
              <p className="mb-6 text-slate-300">Please connect your wallet to start playing Deep Sea Mining.</p>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgradeSubmarine}
          currentTier={playerTier}
        />
      )}
    </div>
  )
}
