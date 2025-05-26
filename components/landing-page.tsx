"use client"

import { useState } from "react"
import { Anchor, Waves, Users, User } from "lucide-react"

interface LandingPageProps {
  onStartSinglePlayer: (username: string) => void
  onStartMultiplayer: (username: string) => void
  onConnectWallet: () => void
  walletConnected: boolean
}

export function LandingPage({
  onStartSinglePlayer,
  onStartMultiplayer,
  onConnectWallet,
  walletConnected,
}: LandingPageProps) {
  const [username, setUsername] = useState("")
  const [gameMode, setGameMode] = useState<"single" | "multi" | null>(null)

  const handleStart = () => {
    if (!username.trim()) return

    if (gameMode === "single") {
      onStartSinglePlayer(username)
    } else if (gameMode === "multi") {
      onStartMultiplayer(username)
    }
  }

  return (
    <div className="relative h-full flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-teal-500/10 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full animate-pulse delay-500" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
        {/* Logo and Title */}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Anchor className="w-20 h-20 text-cyan-400" />
              <Waves className="w-12 h-12 text-teal-400 absolute -bottom-2 -right-2 animate-bounce" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-4">
            OceanX
          </h1>
          <p className="text-xl text-slate-300 mb-2">Dive deep into the abyss and discover precious resources</p>
          <p className="text-lg text-slate-400">
            Upgrade your submarine, compete with other captains, and build your underwater empire
          </p>
        </div>

        {/* Game Mode Selection */}
        {!gameMode && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Choose Your Adventure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Single Player */}
              <button
                onClick={() => setGameMode("single")}
                className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-slate-700 hover:border-cyan-500 transition-all duration-300 hover:bg-slate-800/70"
              >
                <User className="w-12 h-12 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-white mb-2">Solo Expedition</h3>
                <p className="text-slate-300 text-sm">
                  Explore the depths at your own pace. Perfect for learning the ropes and honing your skills.
                </p>
                <div className="mt-4 text-cyan-400 text-sm font-medium">
                  ✓ Offline play ✓ No pressure ✓ Learn mechanics
                </div>
              </button>

              {/* Multiplayer */}
              <button
                onClick={() => setGameMode("multi")}
                className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-slate-700 hover:border-teal-500 transition-all duration-300 hover:bg-slate-800/70"
              >
                <Users className="w-12 h-12 text-teal-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-white mb-2">Fleet Operations</h3>
                <p className="text-slate-300 text-sm">
                  Join other captains in real-time. Compete for resources and climb the leaderboards.
                </p>
                <div className="mt-4 text-teal-400 text-sm font-medium">
                  ✓ Real-time multiplayer ✓ Chat with players ✓ Leaderboards
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Username Input and Start Button */}
        {gameMode && (
          <div className="mb-8">
            <div className="mb-6">
              <button
                onClick={() => setGameMode(null)}
                className="text-slate-400 hover:text-cyan-400 transition-colors mb-4"
              >
                ← Back to mode selection
              </button>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-2">
                {gameMode === "single" ? "Solo Expedition" : "Fleet Operations"}
              </h2>
              <p className="text-slate-300">
                {gameMode === "single"
                  ? "Enter your captain name to begin your solo journey"
                  : "Enter your captain name to join the multiplayer fleet"}
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your captain name"
                className="w-full px-6 py-4 bg-slate-800/50 backdrop-blur-sm text-white text-lg rounded-xl border-2 border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-6"
                maxLength={15}
                onKeyPress={(e) => e.key === "Enter" && handleStart()}
              />

              <button
                onClick={handleStart}
                disabled={!username.trim()}
                className={`w-full px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  gameMode === "single"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50"
                    : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-900/30 hover:shadow-teal-900/50"
                }`}
              >
                {gameMode === "single" ? "Begin Solo Expedition" : "Join the Fleet"}
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-cyan-400 mb-2">🚢 Submarine Upgrades</h3>
            <p className="text-slate-300">
              Enhance your vessel with better engines, mining equipment, and storage capacity
            </p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-teal-400 mb-2">💎 Rare Resources</h3>
            <p className="text-slate-300">Discover valuable minerals hidden in the ocean depths</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-blue-400 mb-2">🌊 Dynamic Ocean</h3>
            <p className="text-slate-300">Experience realistic water physics and immersive underwater environments</p>
          </div>
        </div>

        {/* Wallet Connection */}
        {!walletConnected && (
          <div className="mt-8">
            <button
              onClick={onConnectWallet}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-lg shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 transition-all"
            >
              Connect Wallet (Optional)
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Connect your wallet to enable blockchain features and NFT rewards
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
