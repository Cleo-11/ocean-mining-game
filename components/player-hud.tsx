import type { PlayerStats, PlayerResources } from "@/lib/types"
import { getSubmarineByTier } from "@/lib/submarine-tiers"
import { StatBar, ResourceBar } from "@/components"
import { FuelHUD } from "@/components/fuel-hud"
import { useFuelStore, getFuelWarningLevel } from "@/lib/fuel-system"

interface PlayerHUDProps {
  stats: PlayerStats
  resources: PlayerResources
  tier: number
  powerupActive?: boolean
  powerupType?: "speed" | "energy" | "mining"
  powerupTimer?: number
}

export function PlayerHUD({ stats, resources, tier, powerupActive, powerupType, powerupTimer }: PlayerHUDProps) {
  const submarineData = getSubmarineByTier(tier)
  const { currentFuel, maxFuel } = useFuelStore()
  const fuelPercentage = maxFuel > 0 ? currentFuel / maxFuel : 0
  const fuelWarning = getFuelWarningLevel(fuelPercentage)

  return (
    <div className="absolute left-4 top-4 z-20 space-y-4">
      {/* Main Submarine Status */}
      <div className="rounded-lg bg-slate-900/70 p-4 backdrop-blur-md shadow-lg shadow-cyan-900/20 border border-cyan-900/30">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-cyan-400">SUBMARINE STATUS</h2>
          <div className="rounded-full bg-gradient-to-r from-cyan-800 to-cyan-900 px-2 py-0.5 text-xs font-bold text-cyan-400 shadow-inner shadow-black/20">
            TIER {tier}: {submarineData.name}
          </div>
        </div>

        <div className="space-y-2">
          <StatBar
            label="HULL"
            value={stats.health}
            maxValue={100}
            color="bg-gradient-to-r from-red-600 to-red-500"
            icon="🛡️"
          />
          <StatBar
            label="ENERGY"
            value={stats.energy}
            maxValue={100}
            color="bg-gradient-to-r from-yellow-600 to-yellow-500"
            icon="⚡"
          />

          <div className="mt-4 border-t border-cyan-900/30 pt-2">
            <h3 className="mb-2 text-sm font-bold text-cyan-400 flex items-center">
              <span className="mr-1">📦</span> CARGO
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ResourceBar
                label="NICKEL"
                value={resources.nickel}
                maxValue={stats.capacity.nickel}
                color="bg-gradient-to-r from-blue-600 to-blue-500"
              />
              <ResourceBar
                label="COBALT"
                value={resources.cobalt}
                maxValue={stats.capacity.cobalt}
                color="bg-gradient-to-r from-purple-600 to-purple-500"
              />
              <ResourceBar
                label="COPPER"
                value={resources.copper}
                maxValue={stats.capacity.copper}
                color="bg-gradient-to-r from-orange-600 to-orange-500"
              />
              <ResourceBar
                label="MANGANESE"
                value={resources.manganese}
                maxValue={stats.capacity.manganese}
                color="bg-gradient-to-r from-pink-600 to-pink-500"
              />
            </div>
          </div>

          {powerupActive && (
            <div className="mt-4 border-t border-cyan-900/30 pt-2">
              <h3 className="mb-2 text-sm font-bold text-cyan-400 flex items-center">
                <span className="mr-1">🌟</span> POWERUP
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">{powerupType?.toUpperCase()}</span>
                <span className="text-cyan-400 font-bold">{powerupTimer}S</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fuel System HUD */}
      <FuelHUD
        className={`${
          fuelWarning === "critical" || fuelWarning === "empty"
            ? "border-red-500 shadow-red-900/30"
            : fuelWarning === "low"
              ? "border-yellow-500 shadow-yellow-900/30"
              : ""
        }`}
      />

      {/* Fuel Warning Alert */}
      {(fuelWarning === "low" || fuelWarning === "critical") && (
        <div
          className={`rounded-lg p-3 backdrop-blur-sm border-2 ${
            fuelWarning === "critical"
              ? "bg-red-900/80 border-red-500 animate-pulse"
              : "bg-yellow-900/80 border-yellow-500"
          }`}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            <div>
              <div className={`font-bold text-sm ${fuelWarning === "critical" ? "text-red-300" : "text-yellow-300"}`}>
                {fuelWarning === "critical" ? "CRITICAL FUEL LEVEL" : "LOW FUEL WARNING"}
              </div>
              <div className="text-xs text-slate-300">
                {fuelWarning === "critical" ? "Return to surface immediately!" : "Consider ending expedition soon"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
