"use client"

import type React from "react"

interface ResourceItemProps {
  name: string
  icon: string
  amount: number
  onTrade: () => void
  disabled: boolean
  disabledReason?: string
}

const ResourceItem: React.FC<ResourceItemProps> = ({ name, icon, amount, onTrade, disabled, disabledReason }) => {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center space-x-3">
        <img src={icon || "/placeholder.svg"} alt={name} className="h-8 w-8" />
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-slate-400">Amount: {amount}</p>
        </div>
      </div>
      <button
        onClick={onTrade}
        disabled={disabled}
        className={`w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          disabled ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-cyan-600 text-white hover:bg-cyan-700"
        }`}
        title={disabled && disabledReason ? disabledReason : undefined}
      >
        {disabled ? "Locked" : "Trade"}
      </button>
    </div>
  )
}

export default ResourceItem
