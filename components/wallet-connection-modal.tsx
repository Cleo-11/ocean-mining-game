"use client"

import { useState } from "react"

interface WalletConnectionModalProps {
  onConnect: (username: string) => void
  onClose: () => void
}

export function WalletConnectionModal({ onConnect, onClose }: WalletConnectionModalProps) {
  const [username, setUsername] = useState("")
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleConnect = () => {
    if (username.trim() && selectedWallet) {
      onConnect(username.trim())
    }
  }

  const wallets = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "🦊",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "🔗",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "💙",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-cyan-400">🌊 Join Ocean Mining</h2>
          <p className="text-slate-300">Connect your wallet to start mining</p>
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-slate-300">Captain Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your captain name"
            className="w-full rounded-lg bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            maxLength={20}
          />
        </div>

        {/* Wallet Selection */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-slate-300">Choose Wallet</label>
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => setSelectedWallet(wallet.id)}
                className={`w-full rounded-lg p-4 text-left transition-all ${
                  selectedWallet === wallet.id ? "ring-2 ring-cyan-500 " + wallet.color : wallet.color
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <span className="font-medium text-white">{wallet.name}</span>
                  {selectedWallet === wallet.id && <span className="ml-auto text-cyan-400">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-700 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!username.trim() || !selectedWallet}
            className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect & Play
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 rounded-lg bg-slate-700/50 p-4">
          <h3 className="mb-2 text-sm font-bold text-cyan-400">Game Features</h3>
          <ul className="space-y-1 text-xs text-slate-300">
            <li>• Real-time multiplayer mining</li>
            <li>• Submarine upgrades & customization</li>
            <li>• Resource trading & economy</li>
            <li>• Competitive leaderboards</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
