"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useGame } from "@/contexts/game-context"

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state, updatePlayerPosition, mineResource } = useGame()
  const [keys, setKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => new Set(prev).add(e.key.toLowerCase()))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const newKeys = new Set(prev)
        newKeys.delete(e.key.toLowerCase())
        return newKeys
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let playerX = state.player?.position.x || 400
    let playerY = state.player?.position.y || 300

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw ocean background
      drawOceanBackground(ctx, canvas.width, canvas.height)

      // Handle player movement
      const speed = 3
      let moved = false

      if (keys.has("w") || keys.has("arrowup")) {
        playerY = Math.max(0, playerY - speed)
        moved = true
      }
      if (keys.has("s") || keys.has("arrowdown")) {
        playerY = Math.min(canvas.height - 30, playerY + speed)
        moved = true
      }
      if (keys.has("a") || keys.has("arrowleft")) {
        playerX = Math.max(0, playerX - speed)
        moved = true
      }
      if (keys.has("d") || keys.has("arrowright")) {
        playerX = Math.min(canvas.width - 30, playerX + speed)
        moved = true
      }

      if (moved && state.player) {
        updatePlayerPosition(playerX, playerY, 0)
      }

      // Draw mineral nodes
      drawMineralNodes(ctx)

      // Draw player submarine
      if (state.player) {
        drawSubmarine(ctx, playerX, playerY, state.player.submarineType, "#00ff88", true)
      }

      // Draw other players
      state.otherPlayers.forEach((player) => {
        drawSubmarine(ctx, player.position.x, player.position.y, player.submarineType, "#ff6b6b", false)

        // Draw player name
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.username, player.position.x + 15, player.position.y - 10)
      })

      // Draw UI
      drawUI(ctx, canvas.width, canvas.height)

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [state, keys, updatePlayerPosition])

  const drawOceanBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Ocean gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "#1e40af")
    gradient.addColorStop(0.5, "#1e3a8a")
    gradient.addColorStop(1, "#1e1b4b")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add some bubbles
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
    for (let i = 0; i < 20; i++) {
      const x = (Date.now() * 0.001 + i * 100) % width
      const y = (Date.now() * 0.002 + i * 50) % height
      ctx.beginPath()
      ctx.arc(x, y, 2 + Math.sin(Date.now() * 0.003 + i) * 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawMineralNodes = (ctx: CanvasRenderingContext2D) => {
    // Static mineral nodes for demo
    const nodes = [
      { x: 100, y: 150, type: "nickel", color: "#9ca3af" },
      { x: 300, y: 200, type: "cobalt", color: "#3b82f6" },
      { x: 500, y: 180, type: "copper", color: "#f97316" },
      { x: 200, y: 350, type: "manganese", color: "#8b5cf6" },
      { x: 600, y: 300, type: "nickel", color: "#9ca3af" },
      { x: 150, y: 450, type: "cobalt", color: "#3b82f6" },
    ]

    nodes.forEach((node) => {
      ctx.fillStyle = node.color
      ctx.beginPath()
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2)
      ctx.fill()

      // Glow effect
      ctx.shadowColor = node.color
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(node.x, node.y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    })
  }

  const drawSubmarine = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tier: number,
    color: string,
    isPlayer: boolean,
  ) => {
    ctx.fillStyle = color

    // Submarine body
    ctx.fillRect(x, y + 10, 30, 10)

    // Submarine nose
    ctx.beginPath()
    ctx.moveTo(x + 30, y + 10)
    ctx.lineTo(x + 40, y + 15)
    ctx.lineTo(x + 30, y + 20)
    ctx.fill()

    // Conning tower
    ctx.fillRect(x + 10, y + 5, 8, 10)

    // Tier indicator
    ctx.fillStyle = isPlayer ? "#00ff88" : "#ff6b6b"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`T${tier}`, x + 15, y + 35)
  }

  const drawUI = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!state.player) return

    // Controls
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(10, height - 80, 200, 70)

    ctx.fillStyle = "#ffffff"
    ctx.font = "12px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Controls:", 15, height - 65)
    ctx.fillText("WASD / Arrow Keys - Move", 15, height - 50)
    ctx.fillText("Space - Mine Resource", 15, height - 35)
    ctx.fillText("E - Interact", 15, height - 20)

    // Player stats
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(width - 220, 10, 210, 100)

    ctx.fillStyle = "#ffffff"
    ctx.font = "14px Arial"
    ctx.fillText(`Health: ${state.player.stats.health}`, width - 210, 30)
    ctx.fillText(`Energy: ${state.player.stats.energy}`, width - 210, 50)
    ctx.fillText(`OCX: ${state.player.tokens.toFixed(2)}`, width - 210, 70)
    ctx.fillText(`Tier: ${state.player.submarineType}`, width - 210, 90)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !state.player) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on a mineral node (simple distance check)
    const nodes = [
      { x: 100, y: 150, type: "nickel" },
      { x: 300, y: 200, type: "cobalt" },
      { x: 500, y: 180, type: "copper" },
      { x: 200, y: 350, type: "manganese" },
      { x: 600, y: 300, type: "nickel" },
      { x: 150, y: 450, type: "cobalt" },
    ]

    const playerX = state.player.position.x + 15
    const playerY = state.player.position.y + 15

    nodes.forEach((node) => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      const playerDistance = Math.sqrt((playerX - node.x) ** 2 + (playerY - node.y) ** 2)

      if (distance < 15 && playerDistance < 50) {
        // Mine the resource
        const amount = Math.floor(Math.random() * 5) + 1
        mineResource(node.type, amount, node.x, node.y)
      }
    })
  }

  if (!state.isConnected || !state.gameSession) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <h3 className="text-xl font-bold text-slate-400 mb-4">🎮 Game Canvas</h3>
        <p className="text-slate-500">Join a game session to start playing!</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-cyan-400">🌊 Ocean Mining Game</h3>
        <div className="text-sm text-slate-400">
          Players: {state.gameSession.playerCount}/{state.gameSession.maxPlayers}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="border border-slate-600 rounded cursor-crosshair bg-slate-900"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      <div className="mt-4 text-xs text-slate-400 space-y-1">
        <p>• Use WASD or Arrow Keys to move your submarine</p>
        <p>• Click on glowing mineral nodes to mine resources</p>
        <p>• Stay close to nodes to mine them effectively</p>
        <p>• Green submarine is you, red submarines are other players</p>
      </div>
    </div>
  )
}
