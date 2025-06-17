"use client"

import { GameProvider } from "@/contexts/game-context"
import { WalletConnect } from "@/components/wallet-connect"
import { GameLobby } from "@/components/game-lobby"
import { GameCanvas } from "@/components/game-canvas"

export default function Home() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              🌊 Ocean Mining Game
            </h1>
            <p className="text-slate-400 text-lg">Deep-sea mining adventure with Web3 integration</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Wallet & Lobby */}
            <div className="space-y-6">
              <WalletConnect />
              <GameLobby />
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              <GameCanvas />
            </div>
          </div>

          <footer className="mt-12 text-center text-slate-500 text-sm">
            <p>Built with Next.js, Ethers.js, Socket.IO, and Supabase</p>
            <div className="mt-2 space-x-4">
              <span>🔗 Smart Contracts Deployed</span>
              <span>⚡ Real-time Multiplayer</span>
              <span>🎮 Max 20 Players/Session</span>
            </div>
          </footer>
        </div>
      </div>
    </GameProvider>
  )
}
