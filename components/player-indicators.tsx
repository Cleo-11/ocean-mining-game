"use client"

import { useMultiplayerStore } from "../lib/multiplayer-service"

interface PlayerIndicatorsProps {
  viewportWidth: number
  viewportHeight: number
  cameraX: number
  cameraY: number
}

export function PlayerIndicators({ viewportWidth, viewportHeight, cameraX, cameraY }: PlayerIndicatorsProps) {
  const { players, connected } = useMultiplayerStore()

  if (!connected || players.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {players.map((player) => {
        // Calculate screen position
        const screenX = player.position.x - cameraX
        const screenY = player.position.y - cameraY

        // Check if player is visible on screen
        const isVisible =
          screenX >= -50 && screenX <= viewportWidth + 50 && screenY >= -50 && screenY <= viewportHeight + 50

        if (!isVisible) {
          // Show edge indicator for off-screen players
          const centerX = viewportWidth / 2
          const centerY = viewportHeight / 2

          const angle = Math.atan2(screenY - centerY, screenX - centerX)
          const distance = Math.min(centerX - 40, centerY - 40)

          const indicatorX = centerX + Math.cos(angle) * distance
          const indicatorY = centerY + Math.sin(angle) * distance

          return (
            <div
              key={player.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: indicatorX,
                top: indicatorY,
              }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-3 h-3 bg-cyan-400 rounded-full border-2 border-white shadow-lg"
                  style={{
                    transform: `rotate(${angle}rad)`,
                  }}
                />
                <div className="text-xs text-cyan-400 font-medium mt-1 bg-black/50 px-1 rounded">{player.username}</div>
              </div>
            </div>
          )
        }

        // Show full player indicator for on-screen players
        return (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: screenX,
              top: screenY - 40,
            }}
          >
            <div className="flex flex-col items-center">
              {/* Username */}
              <div className="bg-slate-800/90 text-cyan-400 text-xs font-medium px-2 py-1 rounded-full border border-cyan-600 shadow-lg">
                {player.username}
              </div>

              {/* Connection indicator */}
              <div className="w-2 h-2 bg-green-400 rounded-full mt-1 animate-pulse" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
