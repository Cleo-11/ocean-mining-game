"use client"

import { useEffect, useState } from "react"

interface PowerupIndicatorProps {
  type: "speed" | "energy" | "mining" | "shield"
  timeRemaining: number
  maxTime: number
}

export function PowerupIndicator({ type, timeRemaining, maxTime }: PowerupIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Flash when time is running out
    if (timeRemaining < 3000) {
      const interval = setInterval(() => {
        setIsVisible((prev) => !prev)
      }, 300)
      return () => clearInterval(interval)
    } else {
      setIsVisible(true)
    }
  }, [timeRemaining])

  const getTypeColor = () => {
    switch (type) {
      case "speed":
        return "from-cyan-600 to-blue-600"
      case "energy":
        return "from-yellow-600 to-amber-600"
      case "mining":
        return "from-green-600 to-emerald-600"
      case "shield":
        return "from-purple-600 to-indigo-600"
      default:
        return "from-gray-600 to-gray-700"
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case "speed":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case "energy":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case "mining":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "shield":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  const percentage = (timeRemaining / maxTime) * 100

  return (
    <div
      className={`fixed right-4 top-32 z-50 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-br ${getTypeColor()} shadow-lg transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-30"
      }`}
    >
      <div className="text-white">{getTypeIcon()}</div>
      <div className="absolute inset-0">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle className="stroke-white stroke-2 opacity-30" cx="50" cy="50" r="46" fill="none" strokeWidth="8" />
          <circle
            className="stroke-white stroke-2"
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="8"
            strokeDasharray="289.02652413026095"
            strokeDashoffset={289.02652413026095 * (1 - percentage / 100)}
            transform="rotate(-90 50 50)"
          />
        </svg>
      </div>
      <div className="z-10 text-xs font-bold text-white">{Math.ceil(timeRemaining / 1000)}s</div>
    </div>
  )
}
