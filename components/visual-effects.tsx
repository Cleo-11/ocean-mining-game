"use client"

import { useRef, useEffect } from "react"

interface VisualEffectsProps {
  active: boolean
  type: "mining" | "upgrade" | "powerup" | "boost"
  intensity?: number
}

export function VisualEffects({ active, type, intensity = 1 }: VisualEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    window.addEventListener("resize", handleResize)

    const animate = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp
      const deltaTime = timestamp - timeRef.current
      timeRef.current = timestamp

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (active) {
        if (type === "mining") {
          drawMiningEffect(ctx, canvas.width, canvas.height, timestamp, intensity)
        } else if (type === "upgrade") {
          drawUpgradeEffect(ctx, canvas.width, canvas.height, timestamp, intensity)
        } else if (type === "powerup") {
          drawPowerupEffect(ctx, canvas.width, canvas.height, timestamp, intensity)
        } else if (type === "boost") {
          drawBoostEffect(ctx, canvas.width, canvas.height, timestamp, intensity)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [active, type, intensity])

  const drawMiningEffect = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
    intensity: number,
  ) => {
    // Pulsing vignette effect
    const pulseIntensity = 0.3 + Math.sin(timestamp * 0.005) * 0.1 * intensity
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width)
    gradient.addColorStop(0, "rgba(14, 165, 233, 0)")
    gradient.addColorStop(0.7, `rgba(14, 165, 233, ${pulseIntensity * 0.2})`)
    gradient.addColorStop(1, `rgba(14, 165, 233, ${pulseIntensity})`)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Particles around the edges
    const particleCount = 20 * intensity
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + timestamp * 0.001
      const distance = width * 0.4 + Math.sin(timestamp * 0.002 + i) * 50
      const x = width / 2 + Math.cos(angle) * distance
      const y = height / 2 + Math.sin(angle) * distance

      const particleSize = 2 + Math.sin(timestamp * 0.003 + i * 0.5) * 2
      ctx.fillStyle = "rgba(56, 189, 248, 0.7)"
      ctx.beginPath()
      ctx.arc(x, y, particleSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawUpgradeEffect = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
    intensity: number,
  ) => {
    // Pulsing vignette effect with purple color
    const pulseIntensity = 0.3 + Math.sin(timestamp * 0.005) * 0.1 * intensity
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width)
    gradient.addColorStop(0, "rgba(124, 58, 237, 0)")
    gradient.addColorStop(0.7, `rgba(124, 58, 237, ${pulseIntensity * 0.2})`)
    gradient.addColorStop(1, `rgba(124, 58, 237, ${pulseIntensity})`)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Floating particles
    const particleCount = 30 * intensity
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(timestamp * 0.001 + i * 0.1) * 0.5 + 0.5) * width
      const y = (Math.cos(timestamp * 0.001 + i * 0.1) * 0.5 + 0.5) * height
      const size = 3 + Math.sin(timestamp * 0.002 + i) * 2

      ctx.fillStyle = "rgba(167, 139, 250, 0.7)"
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Glowing lines
    const lineCount = 5 * intensity
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2 + timestamp * 0.0005
      const innerRadius = 100
      const outerRadius = Math.min(width, height) * 0.5

      const x1 = width / 2 + Math.cos(angle) * innerRadius
      const y1 = height / 2 + Math.sin(angle) * innerRadius
      const x2 = width / 2 + Math.cos(angle) * outerRadius
      const y2 = height / 2 + Math.sin(angle) * outerRadius

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, "rgba(167, 139, 250, 0.8)")
      gradient.addColorStop(1, "rgba(167, 139, 250, 0)")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  const drawPowerupEffect = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
    intensity: number,
  ) => {
    // Pulsing vignette effect with gold color
    const pulseIntensity = 0.3 + Math.sin(timestamp * 0.005) * 0.1 * intensity
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width)
    gradient.addColorStop(0, "rgba(234, 179, 8, 0)")
    gradient.addColorStop(0.7, `rgba(234, 179, 8, ${pulseIntensity * 0.2})`)
    gradient.addColorStop(1, `rgba(234, 179, 8, ${pulseIntensity})`)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Sparkles
    const sparkleCount = 40 * intensity
    for (let i = 0; i < sparkleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 3 + 1
      const opacity = Math.random() * 0.7 + 0.3

      ctx.fillStyle = `rgba(250, 204, 21, ${opacity})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Rotating stars
    const starCount = 8 * intensity
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 + timestamp * 0.001
      const distance = 150 + Math.sin(timestamp * 0.002 + i) * 50
      const x = width / 2 + Math.cos(angle) * distance
      const y = height / 2 + Math.sin(angle) * distance

      drawStar(ctx, x, y, 5, 10, 5, "rgba(250, 204, 21, 0.8)")
    }
  }

  const drawBoostEffect = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
    intensity: number,
  ) => {
    // Motion blur effect
    ctx.fillStyle = "rgba(12, 74, 110, 0.3)"
    ctx.fillRect(0, 0, width, height)

    // Speed lines
    const lineCount = 20 * intensity
    for (let i = 0; i < lineCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const length = Math.random() * 100 + 50
      const angle = Math.PI // Horizontal lines

      ctx.strokeStyle = "rgba(125, 211, 252, 0.5)"
      ctx.lineWidth = Math.random() * 2 + 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
      ctx.stroke()
    }

    // Vignette effect
    const vignetteGradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width)
    vignetteGradient.addColorStop(0, "rgba(12, 74, 110, 0)")
    vignetteGradient.addColorStop(1, "rgba(12, 74, 110, 0.7)")

    ctx.fillStyle = vignetteGradient
    ctx.fillRect(0, 0, width, height)
  }

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    color: string,
  ) => {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }

    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20" />
}
