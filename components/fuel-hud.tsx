"use client"

import { useFuelStore, formatTime, getFuelColor, getFuelWarningLevel } from "@/lib/fuel-system"
import { useEffect, useState } from "react"

interface FuelHUDProps {
  className?: string
}

export function FuelHUD({ className = "" }: FuelHUDProps) {
  const { currentFuel, maxFuel, isRefueling, canPlay, checkRefuelStatus, getRemainingRefuelTime } = useFuelStore()

  const [remainingTime, setRemainingTime] = useState(0)

  // Update refuel status and remaining time
  useEffect(() => {
    const interval = setInterval(() => {
      checkRefuelStatus()
      if (isRefueling) {
        setRemainingTime(getRemainingRefuelTime())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRefueling, checkRefuelStatus, getRemainingRefuelTime])

  const fuelPercentage = maxFuel > 0 ? currentFuel / maxFuel : 0
  const warningLevel = getFuelWarningLevel(fuelPercentage)
  const fuelColor = getFuelColor(fuelPercentage)

  return (
    <div className={`rounded-lg bg-slate-900/80 p-4 backdrop-blur-sm border border-slate-700 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-cyan-400 flex items-center">
          <span className="mr-2">⛽</span>
          FUEL SYSTEM
        </h3>
        {warningLevel !== "none" && (
          <div
            className={`text-xs font-bold px-2 py-1 rounded ${
              warningLevel === "critical" || warningLevel === "empty"
                ? "bg-red-600 text-white animate-pulse"
                : "bg-yellow-600 text-white"
            }`}
          >
            {warningLevel === "empty" ? "EMPTY" : warningLevel === "critical" ? "CRITICAL" : "LOW"}
          </div>
        )}
      </div>

      {/* Fuel Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>Fuel</span>
          <span>
            {Math.floor(currentFuel)}/{maxFuel}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              warningLevel === "critical" || warningLevel === "empty"
                ? "bg-gradient-to-r from-red-600 to-red-500 animate-pulse"
                : warningLevel === "low"
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-500"
                  : "bg-gradient-to-r from-green-600 to-green-500"
            }`}
            style={{ width: `${Math.max(0, fuelPercentage * 100)}%` }}
          />
        </div>
      </div>

      {/* Status Display */}
      {isRefueling ? (
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-sm mb-1 flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            REFUELING...
          </div>
          <div className="text-xs text-slate-300">Time remaining: {formatTime(remainingTime)}</div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, 100 - (remainingTime / (45 * 60 * 1000)) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : !canPlay ? (
        <div className="text-center text-red-400 font-bold text-sm">SUBMARINE OFFLINE</div>
      ) : (
        <div className="text-center">
          <div className={`font-bold text-sm ${fuelPercentage > 0.25 ? "text-green-400" : "text-red-400"}`}>
            {fuelPercentage > 0 ? "OPERATIONAL" : "FUEL DEPLETED"}
          </div>
          {warningLevel === "low" && (
            <div className="text-xs text-yellow-400 mt-1">Consider returning to surface soon</div>
          )}
          {warningLevel === "critical" && (
            <div className="text-xs text-red-400 mt-1 animate-pulse">Emergency fuel level!</div>
          )}
        </div>
      )}

      {/* Fuel Efficiency Info */}
      <div className="mt-3 pt-2 border-t border-slate-600">
        <div className="text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Moving:</span>
            <span>-0.5/s</span>
          </div>
          <div className="flex justify-between">
            <span>Mining:</span>
            <span>-2.0/action</span>
          </div>
          <div className="flex justify-between">
            <span>Boost:</span>
            <span>-5.0/use</span>
          </div>
        </div>
      </div>
    </div>
  )
}
