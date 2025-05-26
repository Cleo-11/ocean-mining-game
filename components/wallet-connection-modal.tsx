"use client"

interface WalletConnectionModalProps {
  onConnect: () => void
  onClose: () => void
}

export function WalletConnectionModal({ onConnect, onClose }: WalletConnectionModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-6 shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold text-cyan-400">Connect Wallet</h2>

        <p className="mb-6 text-slate-300">Connect your Web3 wallet to start mining resources from the ocean floor.</p>

        <div className="space-y-3">
          <WalletOption name="MetaMask" icon="/metamask-logo.png" onClick={onConnect} />
          <WalletOption name="WalletConnect" icon="/walletconnect-logo.png" onClick={onConnect} />
          <WalletOption name="Coinbase Wallet" icon="/coinbase-wallet-logo.png" onClick={onConnect} />
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-slate-600 py-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

interface WalletOptionProps {
  name: string
  icon: string
  onClick: () => void
}

function WalletOption({ name, icon, onClick }: WalletOptionProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center rounded-lg bg-slate-700 p-3 transition-colors hover:bg-slate-600"
    >
      <img src={icon || "/placeholder.svg?height=32&width=32&query=wallet"} alt={name} className="mr-3 h-8 w-8" />
      <span className="font-medium text-white">{name}</span>
    </button>
  )
}
