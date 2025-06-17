"use client"

import { useState } from "react"
import { useGame } from "@/contexts/game-context"

export function GameLobby() {
  const { state, joinGame, upgradeSubmarine, claimDailyReward } = useGame()
  const [isJoining, setIsJoining] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoinGame = async () => {
    setIsJoining(true)
    setError(null)

    try {
      await joinGame()
    } catch (err: any) {
      setError(err.message || "Failed to join game")
    } finally {
      setIsJoining(false)
    }
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    setError(null)

    try {
      await upgradeSubmarine()
    } catch (err: any) {
      setError(err.message || "Failed to upgrade submarine")
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleClaimReward = async () => {
    setIsClaiming(true)
    setError(null)

    try {
      await claimDailyReward()
    } catch (err: any) {
      setError(err.message || "Failed to claim reward")
    } finally {
      setIsClaiming(false)
    }
  }

  if (!state.isAuthenticated || !state.player) {
    return null
  }

  if (state.isConnected && state.gameSession) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-green-400 mb-4">🎮 In Game Session</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Session ID:</span>
            <span className="text-white font-mono text-sm">{state.gameSession.sessionId?.slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Players:</span>
            <span className="text-cyan-400">
              {state.gameSession.playerCount}/{state.gameSession.maxPlayers}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-green-400">Connected</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Player Stats */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-bold text-cyan-400 mb-3">⚙️ Submarine Status</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Tier:</span>
            <span className="text-orange-400 font-medium">{state.player.submarineType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Level:</span>
            <span className="text-purple-400 font-medium">{state.player.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Health:</span>
            <span className="text-green-400 font-medium">{state.player.stats.health}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Energy:</span>
            <span className="text-blue-400 font-medium">{state.player.stats.energy}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-bold text-cyan-400 mb-3">🚀 Actions</h3>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleJoinGame}
            disabled={isJoining}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            {isJoining ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Joining...</span>
              </div>
            ) : (
              "Join Game Session"
            )}
          </button>

          <button
            onClick={handleUpgrade}
            disabled={isUpgrading || state.player.submarineType >= 10}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            {isUpgrading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Upgrading...</span>
              </div>
            ) : state.player.submarineType >= 10 ? (
              "Max Tier Reached"
            ) : (
              "Upgrade Submarine"
            )}
          </button>

          <button
            onClick={handleClaimReward}
            disabled={isClaiming}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            {isClaiming ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Claiming...</span>
              </div>
            ) : (
              "Claim Daily Reward"
            )}
          </button>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-bold text-cyan-400 mb-3">💎 Resources</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Nickel:</span>
            <span className="text-gray-400 font-medium">{state.player.resources.nickel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Cobalt:</span>
            <span className="text-blue-400 font-medium">{state.player.resources.cobalt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Copper:</span>
            <span className="text-orange-400 font-medium">{state.player.resources.copper}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Manganese:</span>
            <span className="text-purple-400 font-medium">{state.player.resources.manganese}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
