"use client"

import { useRef, useEffect } from "react"

interface DeepSeaBackgroundProps {
  depth?: number // 0-1 value representing depth (affects darkness and color)
}

export function DeepSeaBackground({ depth = 0.5 }: DeepSeaBackgroundProps) {
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

    // Generate particles
    const particleCount = 100
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    // Generate light beams
    const beamCount = 5
    const beams = Array.from({ length: beamCount }, () => ({
      x: Math.random() * canvas.width,
      width: Math.random() * 100 + 50,
      opacity: Math.random() * 0.2 + 0.1,
      speed: Math.random() * 0.5 + 0.1,
    }))

    const animate = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp
      const deltaTime = timestamp - timeRef.current
      timeRef.current = timestamp

      // Calculate background color based on depth
      const r = Math.floor(12 - depth * 8)
      const g = Math.floor(74 - depth * 50)
      const b = Math.floor(110 - depth * 40)
      const backgroundColor = `rgb(${r}, ${g}, ${b})`

      // Clear and fill background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw light beams
      beams.forEach((beam) => {
        // Move beam
        beam.x += beam.speed * (deltaTime / 16)
        if (beam.x > canvas.width + beam.width) {
          beam.x = -beam.width
          beam.width = Math.random() * 100 + 50
          beam.opacity = Math.random() * 0.2 + 0.1
        }

        // Draw beam
        const gradient = ctx.createLinearGradient(beam.x, 0, beam.x, canvas.height)
        gradient.addColorStop(0, `rgba(173, 216, 230, ${beam.opacity})`)
        gradient.addColorStop(1, "rgba(173, 216, 230, 0)")

        ctx.fillStyle = gradient
        ctx.fillRect(beam.x - beam.width / 2, 0, beam.width, canvas.height)
      })

      // Draw particles
      particles.forEach((particle) => {
        // Move particle
        particle.y -= particle.speed * (deltaTime / 16)
        if (particle.y < 0) {
          particle.y = canvas.height
          particle.x = Math.random() * canvas.width
        }

        // Draw particle
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [depth])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />
}
