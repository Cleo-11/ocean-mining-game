"use client"

import { useEffect, useState } from "react"

interface ScreenShakeProps {
  active: boolean
  intensity: number
  duration: number
}

export function ScreenShake({ active, intensity, duration }: ScreenShakeProps) {
  const [transform, setTransform] = useState("translate(0px, 0px)")
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!active) {
      setTransform("translate(0px, 0px)")
      setElapsed(0)
      return
    }

    const startTime = Date.now()
    let animationFrame: number

    const updateShake = () => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - startTime
      setElapsed(elapsedTime)

      if (elapsedTime < duration) {
        // Calculate remaining intensity based on time elapsed
        const remainingIntensity = intensity * (1 - elapsedTime / duration)

        // Generate random offset
        const offsetX = (Math.random() - 0.5) * 2 * remainingIntensity
        const offsetY = (Math.random() - 0.5) * 2 * remainingIntensity

        setTransform(`translate(${offsetX}px, ${offsetY}px)`)
        animationFrame = requestAnimationFrame(updateShake)
      } else {
        setTransform("translate(0px, 0px)")
      }
    }

    animationFrame = requestAnimationFrame(updateShake)

    return () => {
      cancelAnimationFrame(animationFrame)
      setTransform("translate(0px, 0px)")
    }
  }, [active, intensity, duration])

  return <div className="fixed inset-0 z-50 pointer-events-none" style={{ transform }} />
}
