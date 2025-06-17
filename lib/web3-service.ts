import { ethers } from "ethers"
import { CONTRACTS } from "./contracts"

class Web3Service {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private contracts: Record<string, ethers.Contract> = {}

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    await this.provider.send("eth_requestAccounts", [])
    this.signer = await this.provider.getSigner()

    const address = await this.signer.getAddress()

    // Initialize contracts
    this.initializeContracts()

    return address
  }

  private initializeContracts() {
    if (!this.signer) return

    Object.entries(CONTRACTS).forEach(([name, config]) => {
      this.contracts[name] = new ethers.Contract(config.address, config.abi, this.signer)
    })
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected")
    }
    return await this.signer.signMessage(message)
  }

  async getOCXBalance(address: string): Promise<string> {
    if (!this.contracts.OceanXToken) {
      throw new Error("Contracts not initialized")
    }

    const balance = await this.contracts.OceanXToken.balanceOf(address)
    const decimals = await this.contracts.OceanXToken.decimals()
    return ethers.formatUnits(balance, decimals)
  }

  async getPlayerProfile(address: string): Promise<{ submarineType: number; level: number }> {
    if (!this.contracts.PlayerProfile) {
      throw new Error("Contracts not initialized")
    }

    const [submarineType, level] = await this.contracts.PlayerProfile.getPlayerProfile(address)
    return {
      submarineType: Number(submarineType),
      level: Number(level),
    }
  }

  async getUpgradeCost(currentTier: number): Promise<string> {
    if (!this.contracts.UpgradeManager) {
      throw new Error("Contracts not initialized")
    }

    const cost = await this.contracts.UpgradeManager.getUpgradeCost(currentTier)
    return ethers.formatEther(cost)
  }

  async upgradeSubmarine(): Promise<ethers.TransactionResponse> {
    if (!this.contracts.UpgradeManager) {
      throw new Error("Contracts not initialized")
    }

    return await this.contracts.UpgradeManager.upgradeSubmarine()
  }

  async claimDailyReward(): Promise<ethers.TransactionResponse> {
    if (!this.contracts.DailyMiner) {
      throw new Error("Contracts not initialized")
    }

    return await this.contracts.DailyMiner.claimDailyReward()
  }

  async canClaimDailyReward(address: string): Promise<boolean> {
    if (!this.contracts.DailyMiner) {
      throw new Error("Contracts not initialized")
    }

    const lastClaimTime = await this.contracts.DailyMiner.getLastClaimTime(address)
    const now = Math.floor(Date.now() / 1000)
    return now - Number(lastClaimTime) >= 86400 // 24 hours
  }

  getContract(name: string): ethers.Contract | null {
    return this.contracts[name] || null
  }

  isConnected(): boolean {
    return this.signer !== null
  }
}

export const web3Service = new Web3Service()
