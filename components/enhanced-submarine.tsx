"use client"

interface EnhancedSubmarineProps {
  x: number
  y: number
  rotation: number
  color: string
  tier: number
  isMoving: boolean
  isBoost?: boolean
}

export function EnhancedSubmarine({ x, y, rotation, color, tier, isMoving, isBoost }: EnhancedSubmarineProps) {
  // This function draws a more detailed submarine with animations
  // It would be used in the renderGame function of ocean-mining-game.tsx

  const drawSubmarine = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)

    // Draw propeller wake if moving
    if (isMoving) {
      ctx.fillStyle = "#7dd3fc30"
      ctx.beginPath()
      ctx.moveTo(-40, 0)
      ctx.lineTo(-80, -20)
      ctx.lineTo(-80, 20)
      ctx.closePath()
      ctx.fill()

      // Add more intense wake if boosting
      if (isBoost) {
        ctx.fillStyle = "#0ea5e950"
        ctx.beginPath()
        ctx.moveTo(-40, 0)
        ctx.lineTo(-120, -30)
        ctx.lineTo(-120, 30)
        ctx.closePath()
        ctx.fill()
      }
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
    const propellerAngle = (Date.now() * 0.01) % (Math.PI * 2)
    const propellerSpeed = isBoost ? 0.02 : 0.01
    const currentPropellerAngle = (Date.now() * propellerSpeed) % (Math.PI * 2)

    ctx.fillStyle = "#475569"
    ctx.beginPath()
    ctx.ellipse(-25, 0, 5, 10, currentPropellerAngle, 0, Math.PI * 2)
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
      if (isMoving) {
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

    // Add boost effects
    if (isBoost) {
      // Boost glow
      ctx.fillStyle = "#0ea5e940"
      ctx.beginPath()
      ctx.arc(0, 0, 40, 0, Math.PI * 2)
      ctx.fill()

      // Boost trail
      ctx.fillStyle = "#0ea5e970"
      ctx.beginPath()
      ctx.moveTo(-30, 0)
      ctx.lineTo(-60, -15)
      ctx.lineTo(-100, 0)
      ctx.lineTo(-60, 15)
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
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

  return null // This component doesn't render anything directly, it's a utility for the canvas
}
