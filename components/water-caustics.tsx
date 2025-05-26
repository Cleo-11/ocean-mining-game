"use client"

import { useRef, useEffect } from "react"

interface WaterCausticsProps {
  intensity?: number
  speed?: number
}

export function WaterCaustics({ intensity = 1, speed = 1 }: WaterCausticsProps) {
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

    // Create caustics patterns
    const causticPatterns: HTMLCanvasElement[] = []
    for (let i = 0; i < 3; i++) {
      causticPatterns.push(createCausticPattern(300, 300, i))
    }

    const animate = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp
      const deltaTime = timestamp - timeRef.current
      timeRef.current = timestamp

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw caustics
      const time = timestamp * 0.001 * speed

      ctx.globalAlpha = 0.2 * intensity

      for (let i = 0; i < causticPatterns.length; i++) {
        const pattern = causticPatterns[i]
        const scale = 1 + Math.sin(time * 0.5 + i) * 0.1
        const rotation = time * 0.1 + (i * Math.PI) / 4

        // Draw pattern with different offsets and rotations
        for (let x = -pattern.width; x < canvas.width + pattern.width; x += pattern.width) {
          for (let y = -pattern.height; y < canvas.height + pattern.height; y += pattern.height) {
            ctx.save()
            ctx.translate(x + Math.sin(time * 0.3 + i) * 50, y + Math.cos(time * 0.2 + i) * 50)
            ctx.rotate(rotation)
            ctx.scale(scale, scale)
            ctx.drawImage(pattern, -pattern.width / 2, -pattern.height / 2)
            ctx.restore()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [intensity, speed])

  // Create a single caustic pattern
  const createCausticPattern = (width: number, height: number, seed: number): HTMLCanvasElement => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) return canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw random caustic pattern
    const points = 5 + seed * 2
    const centerX = width / 2
    const centerY = height / 2
    const radius = width * 0.4

    // Create gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)")
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)")
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

    // Draw random blob shapes
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()

      // Start at a random point on the circle
      const startAngle = Math.random() * Math.PI * 2
      const startRadius = radius * (0.5 + Math.random() * 0.5)
      ctx.moveTo(centerX + Math.cos(startAngle) * startRadius, centerY + Math.sin(startAngle) * startRadius)

      // Draw bezier curves around
      for (let j = 0; j < points; j++) {
        const angle1 = startAngle + (j / points) * Math.PI * 2
        const angle2 = startAngle + ((j + 1) / points) * Math.PI * 2

        const radius1 = radius * (0.5 + Math.random() * 0.5)
        const radius2 = radius * (0.5 + Math.random() * 0.5)

        const x1 = centerX + Math.cos(angle1) * radius1
        const y1 = centerY + Math.sin(angle1) * radius1
        const x2 = centerX + Math.cos(angle2) * radius2
        const y2 = centerY + Math.sin(angle2) * radius2

        const cpX1 = centerX + Math.cos(angle1 + Math.PI / 8) * radius1 * 1.2
        const cpY1 = centerY + Math.sin(angle1 + Math.PI / 8) * radius1 * 1.2
        const cpX2 = centerX + Math.cos(angle2 - Math.PI / 8) * radius2 * 1.2
        const cpY2 = centerY + Math.sin(angle2 - Math.PI / 8) * radius2 * 1.2

        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x2, y2)
      }

      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
    }

    return canvas
  }

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 opacity-50" />
}
