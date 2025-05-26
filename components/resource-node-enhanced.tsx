"use client"
import type { ResourceType } from "@/lib/types"
import { getResourceColor } from "@/lib/resource-utils"

interface ResourceNodeEnhancedProps {
  x: number
  y: number
  type: ResourceType
  size: number
  amount: number
  isTarget: boolean
  isMining: boolean
  miningProgress?: number
}

export function ResourceNodeEnhanced({
  x,
  y,
  type,
  size,
  amount,
  isTarget,
  isMining,
  miningProgress = 0,
}: ResourceNodeEnhancedProps) {
  // This function draws a more detailed resource node with animations
  // It would be used in the renderGame function of ocean-mining-game.tsx

  const drawResourceNode = (ctx: CanvasRenderingContext2D, timestamp: number) => {
    const color = getResourceColor(type)
    const pulseSize = Math.sin(timestamp * 0.002) * 0.2 + 1

    // Draw outer glow
    const gradient = ctx.createRadialGradient(x, y, size * 0.5 * pulseSize, x, y, size * 2 * pulseSize)
    gradient.addColorStop(0, color + "80")
    gradient.addColorStop(1, color + "00")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, size * 2 * pulseSize, 0, Math.PI * 2)
    ctx.fill()

    // Draw crystalline shape
    const points = 5 + Math.floor(size / 5)
    const innerRadius = size * 0.6 * pulseSize
    const outerRadius = size * pulseSize

    ctx.fillStyle = color
    ctx.beginPath()

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i / (points * 2)) * Math.PI * 2
      const nodeX = x + Math.cos(angle) * radius
      const nodeY = y + Math.sin(angle) * radius

      if (i === 0) {
        ctx.moveTo(nodeX, nodeY)
      } else {
        ctx.lineTo(nodeX, nodeY)
      }
    }

    ctx.closePath()
    ctx.fill()

    // Add inner glow
    const innerGlow = ctx.createRadialGradient(x, y, innerRadius * 0.2, x, y, innerRadius)
    innerGlow.addColorStop(0, "#ffffff80")
    innerGlow.addColorStop(1, color + "00")

    ctx.fillStyle = innerGlow
    ctx.beginPath()
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2)
    ctx.fill()

    // Draw target indicator
    if (isTarget) {
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(x, y, size + 15, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw node info
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${type.toUpperCase()}`, x, y - size - 25)

      ctx.font = "14px Arial"
      ctx.fillText(`Amount: ${amount}`, x, y - size - 5)

      // Draw mining progress indicator
      if (isMining) {
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, size + 25, 0, Math.PI * 2 * miningProgress)
        ctx.stroke()

        // Add mining particles
        if (Math.random() > 0.7) {
          const particleAngle = Math.random() * Math.PI * 2
          const particleDistance = size + Math.random() * 10
          const particleX = x + Math.cos(particleAngle) * particleDistance
          const particleY = y + Math.sin(particleAngle) * particleDistance

          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(particleX, particleY, Math.random() * 3 + 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Add floating particles around the node
    if (isTarget || Math.random() > 0.9) {
      const particleAngle = Math.random() * Math.PI * 2
      const particleDistance = size * 1.5 + Math.random() * size
      const particleX = x + Math.cos(particleAngle) * particleDistance
      const particleY = y + Math.sin(particleAngle) * particleDistance

      ctx.fillStyle = color + "60"
      ctx.beginPath()
      ctx.arc(particleX, particleY, Math.random() * 2 + 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return null // This component doesn't render anything directly, it's a utility for the canvas
}
