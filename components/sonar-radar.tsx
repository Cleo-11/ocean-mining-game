"use client"

import { useEffect, useRef } from "react"
import type { PlayerPosition, ResourceNode, OtherPlayer } from "@/lib/types"
import { getResourceColor } from "@/lib/resource-utils"

// Update the SonarRadar component to handle dynamic map size
interface SonarRadarProps {
  playerPosition: PlayerPosition
  resourceNodes: ResourceNode[]
  otherPlayers: OtherPlayer[]
  viewportOffset?: { x: number; y: number }
  mapSize?: number
}

export function SonarRadar({
  playerPosition,
  resourceNodes,
  otherPlayers,
  viewportOffset = { x: 0, y: 0 },
  mapSize = 2000,
}: SonarRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 200
    canvas.height = 200

    let animationFrame: number

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw radar background
      ctx.fillStyle = "rgba(0, 20, 40, 0.7)"
      ctx.beginPath()
      ctx.arc(100, 100, 95, 0, Math.PI * 2)
      ctx.fill()

      // Draw radar grid
      ctx.strokeStyle = "rgba(14, 165, 233, 0.3)"
      ctx.lineWidth = 1

      // Draw concentric circles
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath()
        ctx.arc(100, 100, i * 30, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw crosshairs
      ctx.beginPath()
      ctx.moveTo(100, 5)
      ctx.lineTo(100, 195)
      ctx.moveTo(5, 100)
      ctx.lineTo(195, 100)
      ctx.stroke()

      // Draw radar sweep
      const sweepAngle = (Date.now() / 1000) % (Math.PI * 2)
      ctx.fillStyle = "rgba(94, 234, 212, 0.6)"
      ctx.beginPath()
      ctx.moveTo(100, 100)
      ctx.arc(100, 100, 95, sweepAngle - 0.3, sweepAngle)
      ctx.lineTo(100, 100)
      ctx.fill()

      // Map coordinates from world space to radar space
      // Adjust scale based on map size
      const radarRange = Math.min(mapSize / 4, 500) // Adaptive radar range
      const mapToRadar = (worldX: number, worldY: number): [number, number] => {
        const scale = 90 / radarRange

        // Calculate relative position to player
        const relX = worldX - playerPosition.x
        const relY = worldY - playerPosition.y

        // Convert to radar coordinates (centered at 100,100)
        const radarX = 100 + relX * scale
        const radarY = 100 + relY * scale

        return [radarX, radarY]
      }

      // Draw player position (always at center)
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(100, 100, 4, 0, Math.PI * 2)
      ctx.fill()

      // Draw direction indicator
      const playerRotationY = playerPosition.rotation
      const dirX = 100 + Math.cos(playerRotationY) * 8
      const dirY = 100 + Math.sin(playerRotationY) * 8
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(100, 100)
      ctx.lineTo(dirX, dirY)
      ctx.stroke()

      // Draw map boundary indicator
      const boundaryRadius = (mapSize / 2) * (90 / radarRange)
      if (boundaryRadius < 95) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.arc(100, 100, boundaryRadius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw other players
      otherPlayers.forEach((player) => {
        const [radarX, radarY] = mapToRadar(player.position.x, player.position.y)

        // Only show if within radar range
        if (radarX >= 5 && radarX <= 195 && radarY >= 5 && radarY <= 195) {
          ctx.fillStyle = "#22d3ee"
          ctx.beginPath()
          ctx.arc(radarX, radarY, 3, 0, Math.PI * 2)
          ctx.fill()

          // Draw player direction
          const playerDir = player.rotation || 0
          const dirEndX = radarX + Math.cos(playerDir) * 5
          const dirEndY = radarY + Math.sin(playerDir) * 5

          ctx.strokeStyle = "#22d3ee"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(radarX, radarY)
          ctx.lineTo(dirEndX, dirEndY)
          ctx.stroke()
        }
      })

      // Draw resources
      resourceNodes.forEach((node) => {
        if (node.depleted) return

        const [radarX, radarY] = mapToRadar(node.position.x, node.position.y)

        // Only show if within radar range
        if (radarX >= 5 && radarX <= 195 && radarY >= 5 && radarY <= 195) {
          // Only show resources that have been "swept" by the radar
          const resourceAngle = Math.atan2(radarY - 100, radarX - 100)
          const normalizedResourceAngle = resourceAngle < 0 ? resourceAngle + Math.PI * 2 : resourceAngle
          const normalizedSweepAngle = sweepAngle % (Math.PI * 2)

          const isVisible =
            (normalizedResourceAngle <= normalizedSweepAngle && normalizedResourceAngle >= normalizedSweepAngle - 1) ||
            (normalizedSweepAngle < 1 && normalizedResourceAngle >= Math.PI * 2 - (1 - normalizedSweepAngle))

          if (isVisible) {
            const color = getResourceColor(node.type)

            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(radarX, radarY, 2, 0, Math.PI * 2)
            ctx.fill()

            // Add a pulsing effect
            ctx.strokeStyle = color
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(radarX, radarY, 3 + Math.sin(Date.now() / 200) * 1, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      })

      animationFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [playerPosition, resourceNodes, otherPlayers, mapSize])

  return (
    <div className="absolute bottom-4 left-4 z-20 rounded-full border-2 border-cyan-900/50 shadow-lg shadow-cyan-900/20">
      <canvas ref={canvasRef} width={200} height={200} className="rounded-full" />
      <div className="absolute inset-0 rounded-full border border-cyan-500/30" />
      <div className="absolute bottom-2 left-0 right-0 text-center font-mono text-xs text-cyan-400">
        SONAR
        {mapSize > 2000 && <div className="text-yellow-400 text-[10px]">EXPANDED</div>}
      </div>
    </div>
  )
}
