const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface AuthResponse {
  success: boolean
  address: string
  sessionToken: string
}

export interface GameSessionResponse {
  success: boolean
  sessionId: string
  playerCount: number
  maxPlayers: number
  playerData: any
}

export interface SubmarineInfo {
  currentSubmarine: number
  level: number
  upgradeCost: string
  canUpgrade: boolean
}

export interface BalanceInfo {
  balance: string
  balanceWei: string
}

class ApiService {
  async authenticateWallet(address: string, signature: string, message: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, signature, message }),
    })

    if (!response.ok) {
      throw new Error("Authentication failed")
    }

    return response.json()
  }

  async joinGameSession(address: string, sessionToken: string): Promise<GameSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/game/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, sessionToken }),
    })

    if (!response.ok) {
      throw new Error("Failed to join game session")
    }

    return response.json()
  }

  async getSubmarines() {
    const response = await fetch(`${API_BASE_URL}/submarines`)

    if (!response.ok) {
      throw new Error("Failed to get submarines")
    }

    return response.json()
  }

  async getPlayerSubmarine(address: string): Promise<SubmarineInfo> {
    const response = await fetch(`${API_BASE_URL}/player/submarine/${address}`)

    if (!response.ok) {
      throw new Error("Failed to get player submarine")
    }

    return response.json()
  }

  async getPlayerBalance(address: string): Promise<BalanceInfo> {
    const response = await fetch(`${API_BASE_URL}/player/balance/${address}`)

    if (!response.ok) {
      throw new Error("Failed to get player balance")
    }

    return response.json()
  }

  async claimDailyReward(address: string) {
    const response = await fetch(`${API_BASE_URL}/rewards/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    })

    if (!response.ok) {
      throw new Error("Failed to claim daily reward")
    }

    return response.json()
  }
}

export const apiService = new ApiService()
