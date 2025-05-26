"use client"

import { CheckCircle, ArrowUp, Coins } from "lucide-react"

interface StorageFullNotificationProps {
  onUpgrade: () => void
  onTrade: () => void
  canUpgrade: boolean
  nextTierName?: string
}

export function StorageFullNotification({
  onUpgrade,
  onTrade,
  canUpgrade,
  nextTierName,
}: StorageFullNotificationProps) {
  return (
    <div className="absolute inset-x-4 top-20 z-40 mx-auto max-w-md">
      <div className="rounded-xl bg-gradient-to-r from-cyan-900/90 to-teal-900/90 p-4 shadow-2xl backdrop-blur-md border border-cyan-500/30">
        <div className="flex items-center mb-3">
          <CheckCircle className="w-6 h-6 text-cyan-400 mr-2" />
          <h3 className="text-lg font-bold text-cyan-400">Storage Full!</h3>
        </div>

        <p className="text-sm text-cyan-100 mb-4">
          Your submarine's storage is completely full. Choose your next action:
        </p>

        <div className="space-y-2">
          {canUpgrade && (
            <button
              onClick={onUpgrade}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Upgrade to {nextTierName}
            </button>
          )}

          <button
            onClick={onTrade}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            <Coins className="w-4 h-4 mr-2" />
            Trade All for OCE Tokens
          </button>
        </div>

        <div className="mt-3 text-xs text-cyan-200 text-center">You must make a choice to continue mining</div>
      </div>
    </div>
  )
}
