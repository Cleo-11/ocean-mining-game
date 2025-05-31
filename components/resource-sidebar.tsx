"use client"

import { useState } from "react"
import type { GameState, PlayerResources } from "@/lib/types"
import { ResourceItem } from "./resource-item"
import { getSubmarineByTier, SUBMARINE_TIERS } from "@/lib/submarine-tiers"

interface ResourceSidebarProps {
  isOpen: boolean
  resources: PlayerResources
  balance: number
  onTrade: (resource: keyof PlayerResources) => void
  gameState: GameState
  playerStats: { depth: number; resourcesMined: number }
  currentTier: number
  onPurchaseSubmarine: (tier: number) => void
  onClose: () => void
}

export function ResourceSidebar({
  isOpen,
  resources,
  balance,
  onTrade,
  gameState,
  playerStats,
  currentTier,
  onPurchaseSubmarine,
  onClose,
}: ResourceSidebarProps) {
  const [activeTab, setActiveTab] = useState<"resources" | "store">("resources")

  const isTrading = gameState === "trading" || gameState === "resourceTraded"
  const isUpgrading = gameState === "upgrading" || gameState === "upgraded"
  const isDisabled = isTrading || isUpgrading

  // Safe defaults for player stats
  const safePlayerStats = {
    maxCapacity: {
      nickel: 100,
      cobalt: 50,
      copper: 50,
      manganese: 25,
    },
    capacity: {
      nickel: resources?.nickel || 0,
      cobalt: resources?.cobalt || 0,
      copper: resources?.copper || 0,
      manganese: resources?.manganese || 0,
    },
    ...playerStats,
  }

  // Calculate total storage used and capacity
  const totalUsed =
    (resources?.nickel || 0) + (resources?.cobalt || 0) + (resources?.copper || 0) + (resources?.manganese || 0)
  const totalCapacity =
    safePlayerStats.maxCapacity.nickel +
    safePlayerStats.maxCapacity.cobalt +
    safePlayerStats.maxCapacity.copper +
    safePlayerStats.maxCapacity.manganese
  const storagePercentage = Math.round((totalUsed / totalCapacity) * 100)

  // Submarine store functions
  const canAfford = (tier: number) => {
    if (!resources) return false
    if (tier > 1 && tier > currentTier + 1) return false
    if (tier <= currentTier) return false

    try {
      const submarine = getSubmarineByTier(tier)
      return (
        resources.nickel >= submarine.upgradeCost.nickel &&
        resources.cobalt >= submarine.upgradeCost.cobalt &&
        resources.copper >= submarine.upgradeCost.copper &&
        resources.manganese >= submarine.upgradeCost.manganese &&
        balance >= submarine.upgradeCost.tokens
      )
    } catch (error) {
      console.error("Error checking affordability:", error)
      return false
    }
  }

  const isLocked = (tier: number) => {
    return tier > currentTier + 1
  }

  if (!resources) {
    return null
  }

  return (
    <div
      className={`pointer-events-auto absolute right-0 top-0 z-30 h-full w-96 transform bg-slate-900/95 shadow-lg shadow-cyan-900/20 backdrop-blur-md transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header with Close Button and Tabs */}
      <div className="border-b border-slate-700 p-4">
        {/* Close Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-cyan-400">Game Menu</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
            title="Close Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-800 p-1 mb-4">
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              activeTab === "resources"
                ? "bg-cyan-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            📦 Resources
          </button>
          <button
            onClick={() => setActiveTab("store")}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              activeTab === "store"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            🛒 Store
          </button>
        </div>

        {/* Player Resources Summary */}
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">Current Tier:</span>
            <span className="font-bold text-cyan-400">Tier {currentTier}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">OCE Balance:</span>
            <span className="font-mono text-yellow-400">{balance.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Storage:</span>
            <span className="font-mono text-cyan-400">
              {totalUsed}/{totalCapacity}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full ${
                storagePercentage > 90 ? "bg-red-500" : storagePercentage > 70 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="h-full overflow-y-auto pb-20">
        {activeTab === "resources" ? (
          <div className="p-4 space-y-6">
            {/* Inventory */}
            <div>
              <h3 className="mb-3 border-b border-cyan-900/50 pb-1 text-lg font-semibold text-slate-200">Inventory</h3>
              <div className="grid grid-cols-2 gap-3">
                <ResourceItem
                  name="Nickel"
                  icon="🔋"
                  amount={resources.nickel}
                  capacity={safePlayerStats.capacity.nickel}
                  maxCapacity={safePlayerStats.maxCapacity.nickel}
                  onTrade={() => onTrade("nickel")}
                  disabled={isDisabled || resources.nickel <= 0}
                />
                <ResourceItem
                  name="Cobalt"
                  icon="⚡"
                  amount={resources.cobalt}
                  capacity={safePlayerStats.capacity.cobalt}
                  maxCapacity={safePlayerStats.maxCapacity.cobalt}
                  onTrade={() => onTrade("cobalt")}
                  disabled={isDisabled || resources.cobalt <= 0}
                />
                <ResourceItem
                  name="Copper"
                  icon="🔌"
                  amount={resources.copper}
                  capacity={safePlayerStats.capacity.copper}
                  maxCapacity={safePlayerStats.maxCapacity.copper}
                  onTrade={() => onTrade("copper")}
                  disabled={isDisabled || resources.copper <= 0}
                />
                <ResourceItem
                  name="Manganese"
                  icon="🧲"
                  amount={resources.manganese}
                  capacity={safePlayerStats.capacity.manganese}
                  maxCapacity={safePlayerStats.maxCapacity.manganese}
                  onTrade={() => onTrade("manganese")}
                  disabled={isDisabled || resources.manganese <= 0}
                />
              </div>
            </div>

            {/* Market Prices */}
            <div>
              <h3 className="mb-3 border-b border-cyan-900/50 pb-1 text-lg font-semibold text-slate-200">
                Market Prices
              </h3>
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
        ) : (
          <div className="p-4">
            <h3 className="mb-4 text-lg font-semibold text-slate-200">🚢 Submarine Store</h3>
            <div className="space-y-4">
              {SUBMARINE_TIERS.map((submarine) => (
                <SubmarineStoreItem
                  key={submarine.tier}
                  submarine={submarine}
                  isOwned={submarine.tier <= currentTier}
                  canAfford={canAfford(submarine.tier)}
                  isLocked={isLocked(submarine.tier)}
                  onPurchase={() => onPurchaseSubmarine(submarine.tier)}
                  resources={resources}
                  balance={balance}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface SubmarineStoreItemProps {
  submarine: any
  isOwned: boolean
  canAfford: boolean
  isLocked: boolean
  onPurchase: () => void
  resources: PlayerResources
  balance: number
}

function SubmarineStoreItem({
  submarine,
  isOwned,
  canAfford,
  isLocked,
  onPurchase,
  resources,
  balance,
}: SubmarineStoreItemProps) {
  const [expanded, setExpanded] = useState(false)

  const getStatusColor = () => {
    if (isOwned) return "border-green-500/50 bg-green-900/10"
    if (isLocked) return "border-gray-500/50 bg-gray-900/10"
    if (canAfford) return "border-cyan-500/50 bg-cyan-900/10"
    return "border-red-500/50 bg-red-900/10"
  }

  const getStatusText = () => {
    if (isOwned) return "OWNED"
    if (isLocked) return "LOCKED"
    if (canAfford) return "AVAILABLE"
    return "INSUFFICIENT"
  }

  const getStatusTextColor = () => {
    if (isOwned) return "text-green-400"
    if (isLocked) return "text-gray-400"
    if (canAfford) return "text-cyan-400"
    return "text-red-400"
  }

  return (
    <div className={`rounded-lg border p-4 transition-all ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${submarine.color}60)` }}>
            {isLocked ? "🔒" : "🚢"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-cyan-400">{submarine.name}</h4>
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-bold text-cyan-400">
                T{submarine.tier}
              </span>
            </div>
            <div className={`text-xs font-bold ${getStatusTextColor()}`}>{getStatusText()}</div>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white transition-colors">
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Price */}
      <div className="mb-3 text-center">
        <div className="text-lg font-bold text-yellow-400">💰 {submarine.upgradeCost.tokens.toLocaleString()} OCE</div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-slate-400">Health:</span>
          <span className="text-cyan-400">{submarine.baseStats.health}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Energy:</span>
          <span className="text-cyan-400">{submarine.baseStats.energy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Depth:</span>
          <span className="text-cyan-400">{submarine.baseStats.depth}m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Storage:</span>
          <span className="text-cyan-400">
            {submarine.baseStats.maxCapacity.nickel +
              submarine.baseStats.maxCapacity.cobalt +
              submarine.baseStats.maxCapacity.copper +
              submarine.baseStats.maxCapacity.manganese}
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-600 pt-3 mt-3 space-y-3">
          <p className="text-xs text-slate-400">{submarine.description}</p>

          {/* Resource Requirements */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2">Required Resources:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`flex justify-between ${resources.nickel >= submarine.upgradeCost.nickel ? "text-green-400" : "text-red-400"}`}
              >
                <span>🔋 Nickel:</span>
                <span>
                  {resources.nickel}/{submarine.upgradeCost.nickel}
                </span>
              </div>
              <div
                className={`flex justify-between ${resources.cobalt >= submarine.upgradeCost.cobalt ? "text-green-400" : "text-red-400"}`}
              >
                <span>⚡ Cobalt:</span>
                <span>
                  {resources.cobalt}/{submarine.upgradeCost.cobalt}
                </span>
              </div>
              <div
                className={`flex justify-between ${resources.copper >= submarine.upgradeCost.copper ? "text-green-400" : "text-red-400"}`}
              >
                <span>🔌 Copper:</span>
                <span>
                  {resources.copper}/{submarine.upgradeCost.copper}
                </span>
              </div>
              <div
                className={`flex justify-between ${resources.manganese >= submarine.upgradeCost.manganese ? "text-green-400" : "text-red-400"}`}
              >
                <span>🧲 Manganese:</span>
                <span>
                  {resources.manganese}/{submarine.upgradeCost.manganese}
                </span>
              </div>
            </div>
          </div>

          {submarine.specialAbility && (
            <div className="rounded-lg bg-cyan-900/30 p-2">
              <div className="text-xs font-bold text-cyan-300">SPECIAL ABILITY</div>
              <div className="text-xs text-cyan-200">{submarine.specialAbility}</div>
            </div>
          )}
        </div>
      )}

      {/* Purchase Button */}
      <div className="mt-3">
        {isOwned ? (
          <div className="w-full rounded-lg bg-green-600 py-2 text-sm font-bold text-white text-center">✓ OWNED</div>
        ) : isLocked ? (
          <div className="w-full rounded-lg bg-gray-600 py-2 text-sm font-bold text-gray-300 text-center">
            🔒 LOCKED - Purchase Previous Tier First
          </div>
        ) : (
          <button
            onClick={onPurchase}
            disabled={!canAfford}
            className={`w-full rounded-lg py-2 text-sm font-bold transition-all ${
              canAfford
                ? "bg-gradient-to-r from-teal-600 to-cyan-700 text-white hover:shadow-lg"
                : "bg-slate-600 text-slate-400 cursor-not-allowed"
            }`}
          >
            {canAfford ? "Purchase" : "Insufficient Resources"}
          </button>
        )}
      </div>
    </div>
  )
}
