"use client"

import type { GameState, PlayerStats, PlayerResources } from "@/lib/types"
import { ResourceItem } from "./resource-item"
import { getStorageStatus } from "@/lib/resource-utils"

interface ResourceSidebarProps {
  isOpen: boolean
  resources: PlayerResources
  balance: number
  onTrade: (resource: keyof PlayerResources) => void
  gameState: GameState
  playerStats: PlayerStats
}

export function ResourceSidebar({ isOpen, resources, balance, onTrade, gameState, playerStats }: ResourceSidebarProps) {
  const isTrading = gameState === "trading" || gameState === "resourceTraded"
  const isUpgrading = gameState === "upgrading" || gameState === "upgraded"
  const isDisabled = isTrading || isUpgrading

  // Calculate storage status
  const storageStatus = getStorageStatus(resources, playerStats)
  const canTrade = storageStatus.isMaxed

  return (
    <div
      className={`pointer-events-auto absolute right-0 top-0 z-30 h-full w-80 transform bg-slate-900/90 p-6 shadow-lg shadow-cyan-900/20 backdrop-blur-md transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <h2 className="mb-6 text-2xl font-bold text-cyan-400">RESOURCES</h2>

      {/* Storage Overview */}
      <div className="mb-4 rounded-lg bg-slate-800/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Storage:</span>
          <span className="font-mono text-cyan-400">
            {storageStatus.totalUsed}/{storageStatus.totalCapacity}
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
          <div
            className={`h-full rounded-full ${
              storageStatus.percentage === 100
                ? "bg-cyan-500 animate-pulse"
                : storageStatus.percentage > 90
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${storageStatus.percentage}%` }}
          />
        </div>
        {storageStatus.isMaxed && (
          <div className="mt-2 text-center text-sm text-cyan-400 animate-pulse">
            ✨ Storage Full - Ready to Trade or Upgrade! ✨
          </div>
        )}
        {!storageStatus.isMaxed && (
          <div className="mt-2 text-center text-xs text-slate-400">Fill all storage to unlock trading</div>
        )}
      </div>

      {/* Inventory */}
      <div className="mb-8">
        <h3 className="mb-3 border-b border-cyan-900/50 pb-1 text-lg font-semibold text-slate-200">Inventory</h3>
        <div className="grid grid-cols-2 gap-4">
          <ResourceItem
            name="Nickel"
            icon="🔋"
            amount={resources.nickel}
            onTrade={() => onTrade("nickel")}
            disabled={isDisabled || resources.nickel <= 0 || !canTrade}
            disabledReason={!canTrade ? "Fill all storage to trade" : undefined}
          />
          <ResourceItem
            name="Cobalt"
            icon="⚡"
            amount={resources.cobalt}
            onTrade={() => onTrade("cobalt")}
            disabled={isDisabled || resources.cobalt <= 0 || !canTrade}
            disabledReason={!canTrade ? "Fill all storage to trade" : undefined}
          />
          <ResourceItem
            name="Copper"
            icon="🔌"
            amount={resources.copper}
            onTrade={() => onTrade("copper")}
            disabled={isDisabled || resources.copper <= 0 || !canTrade}
            disabledReason={!canTrade ? "Fill all storage to trade" : undefined}
          />
          <ResourceItem
            name="Manganese"
            icon="🧲"
            amount={resources.manganese}
            onTrade={() => onTrade("manganese")}
            disabled={isDisabled || resources.manganese <= 0 || !canTrade}
            disabledReason={!canTrade ? "Fill all storage to trade" : undefined}
          />
        </div>
      </div>

      {/* Wallet */}
      <div className="mb-8">
        <h3 className="mb-3 border-b border-cyan-900/50 pb-1 text-lg font-semibold text-slate-200">Wallet</h3>
        <div className="rounded-lg bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">OCE Balance:</span>
            <span className="font-mono text-lg font-bold text-cyan-400">{balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Market Prices */}
      <div>
        <h3 className="mb-3 border-b border-cyan-900/50 pb-1 text-lg font-semibold text-slate-200">Market Prices</h3>
        <div className="rounded-lg bg-slate-800/50 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-slate-300">
                <span className="mr-2">🔋</span> Nickel
              </span>
              <span className="font-mono text-cyan-400">5-15 OCE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-slate-300">
                <span className="mr-2">⚡</span> Cobalt
              </span>
              <span className="font-mono text-cyan-400">10-25 OCE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-slate-300">
                <span className="mr-2">🔌</span> Copper
              </span>
              <span className="font-mono text-cyan-400">8-20 OCE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-slate-300">
                <span className="mr-2">🧲</span> Manganese
              </span>
              <span className="font-mono text-cyan-400">15-35 OCE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
