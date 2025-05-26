"use client"

import { useFuelStore, formatTime } from "@/lib/fuel-system"
import { useEffect, useState } from "react"

interface OutOfFuelModalProps {
  onClose?: () => void
}

export function OutOfFuelModal({ onClose }: OutOfFuelModalProps) {
  const { isRefueling, canPlay, getRemainingRefuelTime, checkRefuelStatus, resetFuel } = useFuelStore()

  const [remainingTime, setRemainingTime] = useState(0)
  const [showEmergencyRefuel, setShowEmergencyRefuel] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      checkRefuelStatus()
      if (isRefueling) {
        const remaining = getRemainingRefuelTime()
        setRemainingTime(remaining)

        // If refuel is complete, close modal
        if (remaining <= 0 && canPlay) {
          onClose?.()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRefueling, canPlay, checkRefuelStatus, getRemainingRefuelTime, onClose])

  const handleEmergencyRefuel = () => {
    // In a real game, this would cost premium currency or require watching an ad
    resetFuel()
    onClose?.()
  }

  const progressPercentage = Math.max(0, 100 - (remainingTime / (45 * 60 * 1000)) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 rounded-xl bg-slate-800 border-2 border-red-500 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-t-xl">
          <div className="flex items-center justify-center">
            <div className="text-3xl mr-3">⛽</div>
            <div>
              <h2 className="text-xl font-bold text-white">Fuel Depleted</h2>
              <p className="text-red-100 text-sm">Submarine systems offline</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-slate-300 mb-4">
              Your submarine has run out of fuel and needs time to refuel from the surface support vessel.
            </div>

            {isRefueling ? (
              <div>
                <div className="text-cyan-400 font-bold text-lg mb-2">Refueling in Progress...</div>
                <div className="text-2xl font-mono text-white mb-4">{formatTime(remainingTime)}</div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000 flex items-center justify-center"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <span className="text-xs font-bold text-white">{Math.floor(progressPercentage)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-400 font-bold">Initializing refuel sequence...</div>
            )}
          </div>

          {/* Emergency Options */}
          <div className="border-t border-slate-600 pt-4">
            <div className="text-center mb-4">
              <button
                onClick={() => setShowEmergencyRefuel(!showEmergencyRefuel)}
                className="text-yellow-400 hover:text-yellow-300 text-sm underline transition-colors"
              >
                Emergency Refuel Options
              </button>
            </div>

            {showEmergencyRefuel && (
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="text-sm text-slate-300 mb-3">Skip the wait time with emergency refuel:</div>
                <div className="space-y-2">
                  <button
                    onClick={handleEmergencyRefuel}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    🎬 Watch Ad for Instant Refuel
                  </button>
                  <button
                    onClick={handleEmergencyRefuel}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    💎 Use 50 Premium Crystals
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-2 text-center">
                  * Emergency refuel options are for demonstration
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold text-sm mb-2">⚡ Fuel Management Tips:</h4>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Plan your mining routes efficiently</li>
              <li>• Avoid unnecessary movement and boosting</li>
              <li>• Upgrade your submarine for better fuel efficiency</li>
              <li>• Monitor fuel levels during long expeditions</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-4 rounded-b-xl text-center">
          <div className="text-xs text-slate-400">Refuel time: 45 minutes | Next expedition starts automatically</div>
        </div>
      </div>
    </div>
  )
}
