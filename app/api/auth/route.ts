import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateNonce, createSignMessage } from "@/lib/auth-service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { walletAddress, signature, message, username } = body

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // If no signature provided, generate a nonce for signing
    if (!signature) {
      const nonce = generateNonce()
      const signMessage = createSignMessage(walletAddress, nonce)

      return NextResponse.json({
        message: signMessage,
        nonce,
      })
    }

    // Verify signature and authenticate user
    const authResult = await authenticateUser(walletAddress, signature, message, username)

    return NextResponse.json({
      token: authResult.token,
      user: authResult.user,
    })
  } catch (error: any) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 401 })
  }
}
