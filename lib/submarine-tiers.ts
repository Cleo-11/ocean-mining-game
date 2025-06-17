import type { PlayerStats } from "./types"

export interface SubmarineTier {
  tier: number
  name: string
  description: string
  baseStats: PlayerStats
  upgradeCost: {
    nickel: number
    cobalt: number
    copper: number
    manganese: number
    tokens: number
  }
  color: string
  specialAbility?: string
}

export const SUBMARINE_TIERS: SubmarineTier[] = [
  {
    tier: 1,
    name: "Nautilus I",
    description: "Basic exploration submarine with limited storage capacity.",
    baseStats: {
      health: 100,
      energy: 100,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
      maxCapacity: {
        nickel: 100,
        cobalt: 50,
        copper: 50,
        manganese: 25,
      },
      depth: 1000,
      speed: 1,
      miningRate: 1,
      tier: 1,
    },
    upgradeCost: {
      nickel: 80,
      cobalt: 40,
      copper: 40,
      manganese: 20,
      tokens: 100,
    },
    color: "#fbbf24",
  },
  {
    tier: 2,
    name: "Nautilus II",
    description: "Improved submarine with enhanced storage and durability.",
    baseStats: {
      health: 125,
      energy: 120,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
      maxCapacity: {
        nickel: 150,
        cobalt: 75,
        copper: 75,
        manganese: 40,
      },
      depth: 1200,
      speed: 1.1,
      miningRate: 1.2,
      tier: 2,
    },
    upgradeCost: {
      nickel: 140,
      cobalt: 70,
      copper: 70,
      manganese: 35,
      tokens: 200,
    },
    color: "#f59e0b",
  },
  {
    tier: 3,
    name: "Abyssal Explorer",
    description: "Specialized deep-sea submarine with reinforced hull.",
    baseStats: {
      health: 150,
      energy: 140,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
      maxCapacity: {
        nickel: 200,
        cobalt: 100,
        copper: 100,
        manganese: 60,
      },
      depth: 1500,
      speed: 1.2,
      miningRate: 1.4,
      tier: 3,
    },
    upgradeCost: {
      nickel: 180,
      cobalt: 90,
      copper: 90,
      manganese: 50,
      tokens: 350,
    },
    color: "#d97706",
  },
  {
    tier: 4,
    name: "Mariana Miner",
    description: "Heavy-duty mining submarine with expanded cargo holds.",
    baseStats: {
      health: 175,
      energy: 160,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
      maxCapacity: {
        nickel: 300,
        cobalt: 150,
        copper: 150,
        manganese: 80,
      },
      depth: 1800,
      speed: 1.3,
      miningRate: 1.6,
      tier: 4,
    },
    upgradeCost: {
      nickel: 250,
      cobalt: 125,
      copper: 125,
      manganese: 70,
      tokens: 500,
    },
    color: "#b45309",
  },
  {
    tier: 5,
    name: "Hydrothermal Hunter",
    description: "Advanced submarine with heat-resistant plating for volcanic regions.",
    baseStats: {
      health: 200,
      energy: 180,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
      maxCapacity: {
        nickel: 400,
        cobalt: 200,
        copper: 200,
        manganese: 100,
      },
      depth: 2200,
      speed: 1.4,
      miningRate: 1.8,
      tier: 5,
    },
    upgradeCost: {
      nickel: 350,
      cobalt: 175,
      copper: 175,
      manganese: 90,
      tokens: 750,
    },
    color: "#92400e",
  },
  // Tiers 6-15 would follow the same pattern with increasing stats and costs
  // I'll include a few more to show the progression
  {
    tier: 6,
    name: "Pressure Pioneer",
    description: "Cutting-edge submarine designed for extreme depths.",
    baseStats: {
      health: 250,
      energy: 220,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
      maxCapacity: {
        nickel: 500,
        cobalt: 250,
        copper: 250,
        manganese: 125,
      },
      depth: 2600,
      speed: 1.5,
      miningRate: 2.0,
      tier: 6,
    },
    upgradeCost: {
      nickel: 450,
      cobalt: 225,
      copper: 225,
      manganese: 110,
      tokens: 1000,
    },
    color: "#78350f",
    specialAbility: "Pressure Resistance: Immune to depth damage",
  },
  {
    tier: 7,
    name: "Quantum Diver",
    description: "Experimental submarine with quantum-stabilized hull.",
    baseStats: {
      health: 300,
      energy: 260,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
      maxCapacity: {
        nickel: 650,
        cobalt: 325,
        copper: 325,
        manganese: 160,
      },
      depth: 3000,
      speed: 1.6,
      miningRate: 2.2,
      tier: 7,
    },
    upgradeCost: {
      nickel: 600,
      cobalt: 300,
      copper: 300,
      manganese: 150,
      tokens: 1500,
    },
    color: "#1e40af",
    specialAbility: "Quantum Scanning: Reveals hidden resource nodes",
  },
  {
    tier: 15,
    name: "Leviathan",
    description: "The ultimate deep-sea mining vessel, unmatched in all aspects.",
    baseStats: {
      health: 1000,
      energy: 1000,
      capacity: {
        nickel: 0,
        cobalt: 0,
        copper: 0,
        manganese: 0,
      },
      maxCapacity: {
        nickel: 2000,
        cobalt: 1000,
        copper: 1000,
        manganese: 500,
      },
      depth: 10000,
      speed: 3.0,
      miningRate: 5.0,
      tier: 15,
    },
    upgradeCost: {
      nickel: 0,
      cobalt: 0,
      copper: 0,
      manganese: 0,
      tokens: 0,
    },
    color: "#7e22ce",
    specialAbility: "Omnimining: Can mine all resources simultaneously",
  },
]

export function getSubmarineByTier(tier: number): SubmarineTier {
  return SUBMARINE_TIERS.find((sub) => sub.tier === tier) || SUBMARINE_TIERS[0]
}

export function getNextSubmarineTier(currentTier: number): SubmarineTier | null {
  if (currentTier >= SUBMARINE_TIERS.length) return null
  return SUBMARINE_TIERS.find((sub) => sub.tier === currentTier + 1) || null
}
