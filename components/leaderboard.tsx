"use client"

import { useState } from "react"
import { useMultiplayerStore } from "../lib/multiplayer-service"
import { Trophy, Users, X } from "lucide-react"

export function Leaderboard() {
  const [isOpen, setIsOpen] = useState(false)
  const { leaderboard, players, connected } = useMultiplayerStore()

  if (!connected) return null

  return (
    <>
      {/* Leaderboard Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-50 p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-cyan-600 text-cyan-400 hover:bg-slate-700/80 transition-all"
      >
        <Trophy size={20} />
      </button>

      {/* Leaderboard Panel */}
      {isOpen && (
        <div className="fixed top-32 right-4 z-50 w-72 bg-slate-800/95 backdrop-blur-sm rounded-lg border border-cyan-600">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="text-yellow-500" size={20} />
              <h3 className="text-cyan-400 font-medium">Leaderboard</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Online Players Count */}
            <div className="flex items-center space-x-2 mb-4 text-sm text-slate-300">
              <Users size={16} />
              <span>{players.length + 1} captains exploring</span>
            </div>

            {/* Leaderboard List */}
            {leaderboard.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-4">Start mining to see rankings!</div>
            ) : (
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      index === 0
                        ? "bg-yellow-900/30 border border-yellow-600"
                        : index === 1
                          ? "bg-slate-600/30 border border-slate-500"
                          : index === 2
                            ? "bg-orange-900/30 border border-orange-600"
                            : "bg-slate-700/30"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-sm font-bold ${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                              ? "text-slate-300"
                              : index === 2
                                ? "text-orange-400"
                                : "text-slate-400"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span className="text-white text-sm font-medium">{player.username}</span>
                    </div>
                    <span className="text-cyan-400 text-sm font-bold">{player.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Current Session Stats */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h4 className="text-slate-300 text-sm font-medium mb-2">Session Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/50 p-2 rounded">
                  <div className="text-slate-400">Active Players</div>
                  <div className="text-cyan-400 font-bold">{players.length + 1}</div>
                </div>
                <div className="bg-slate-700/50 p-2 rounded">
                  <div className="text-slate-400">Top Score</div>
                  <div className="text-yellow-400 font-bold">{leaderboard[0]?.score?.toLocaleString() || "0"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
