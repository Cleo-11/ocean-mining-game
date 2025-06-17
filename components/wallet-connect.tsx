"use client"

import { useState } from "react"
import { useGame } from "@/contexts/game-context"

export function WalletConnect() {
  const { state, connectWallet } = useGame()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      await connectWallet()
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  if (state.isAuthenticated && state.player) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <p className="text-white font-medium">{state.player.username}</p>
            <p className="text-slate-400 text-sm">
              {state.player.address.slice(0, 6)}...{state.player.address.slice(-4)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-slate-400">OCX Balance:</span>
          <span className="text-cyan-400 font-medium">{state.player.tokens.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Submarine:</span>
          <span className="text-orange-400 font-medium">Tier {state.player.submarineType}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-cyan-400 mb-4">🌊 Ocean Mining</h2>
      <p className="text-slate-300 mb-6">Connect your wallet to start mining in the deep ocean!</p>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
      >
        {isConnecting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          "Connect Wallet"
        )}
      </button>

      <div className="mt-4 text-xs text-slate-400 space-y-1">
        <p>• MetaMask, WalletConnect, or Coinbase Wallet required</p>
        <p>• Signature required for authentication</p>
        <p>• No gas fees for connecting</p>
      </div>
    </div>
  )
}
