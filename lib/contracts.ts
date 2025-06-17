export const CONTRACTS = {
  OceanXToken: {
    address: "0x7082bd37ea9552faf0549abb868602135aada705",
    abi: [
      "function balanceOf(address owner) view returns (uint256)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      "function mint(address to, uint256 amount)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
    ],
  },
  PlayerProfile: {
    address: "0x3b4682e9e31c0fb9391967ce51c58e8b4cc02063",
    abi: [
      "function createProfile(address player)",
      "function updateSubmarine(address player, uint8 submarineType)",
      "function getPlayerProfile(address player) view returns (uint8 submarineType, uint256 level)",
      "function playerExists(address player) view returns (bool)",
    ],
  },
  UpgradeManager: {
    address: "0xb8ca16e41aac1e17dc5ddd22c5f20b35860f9a0c",
    abi: [
      "function upgradeSubmarine(address player)",
      "function getUpgradeCost(uint8 currentTier) view returns (uint256)",
      "function canUpgrade(address player) view returns (bool)",
    ],
  },
  DailyMiner: {
    address: "0x8b0f0580fe26554bbfa2668ee042f20301c3ced3",
    abi: [
      "function claimDailyReward(address player)",
      "function getLastClaimTime(address player) view returns (uint256)",
      "function getDailyReward() view returns (uint256)",
      "function updateRewards(uint256 newReward)",
    ],
  },
} as const

export type ContractName = keyof typeof CONTRACTS
