"use client"

import { useState } from "react"
import { useMultiplayerStore } from "../lib/multiplayer-service"

interface MultiplayerConnectionProps {
  onConnect: () => void
  serverUrl: string
}

export function MultiplayerConnection({ onConnect, serverUrl }: MultiplayerConnectionProps) {
  const [username, setUsername] = useState("")
  const [submarineType, setSubmarineType] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const connect = useMultiplayerStore((state) => state.connect)
  const connected = useMultiplayerStore((state) => state.connected)
  const error = useMultiplayerStore((state) => state.error)

  const handleConnect = async () => {
    if (!username.trim()) return

    setIsConnecting(true)

    try {
      connect(serverUrl, username, submarineType)

      // Give some time for the connection to establish
      setTimeout(() => {
        setIsConnecting(false)
        onConnect()
      }, 2000)
    } catch (err) {
      setIsConnecting(false)
      console.error("Connection failed:", err)
    }
  }

  const submarineTypes = [
    { id: 1, name: "Explorer", description: "Balanced stats, good for beginners" },
    { id: 2, name: "Speedster", description: "Fast movement, lower capacity" },
    { id: 3, name: "Harvester", description: "High capacity, slower movement" },
  ]

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-md z-50">
      <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border-2 border-cyan-600 w-full max-w-md">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Join Multiplayer Game</h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Captain Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your captain name"
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              maxLength={15}
              disabled={isConnecting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Choose Your Submarine</label>
            <div className="space-y-2">
              {submarineTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSubmarineType(type.id)}
                  disabled={isConnecting}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    submarineType === type.id
                      ? "bg-cyan-900/50 border-cyan-500 text-cyan-300"
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  } ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-bold text-lg">{type.name}</div>
                  <div className="text-sm opacity-80">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-300 text-sm">{error}</div>
          )}

          <div className="text-xs text-slate-400 bg-slate-700/50 rounded p-3">
            <strong>Server:</strong> {serverUrl}
          </div>

          <button
            onClick={handleConnect}
            disabled={!username.trim() || isConnecting}
            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting to Ocean...
              </div>
            ) : (
              "Dive In!"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
