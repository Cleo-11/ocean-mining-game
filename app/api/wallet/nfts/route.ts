import { type NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "@/lib/auth-service"
import { getWalletNFTs } from "@/lib/db-service"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const chain = searchParams.get("chain") || "eth"

    const nfts = await getWalletNFTs(user.walletAddress, chain)

    return NextResponse.json({ nfts })
  } catch (error: any) {
    console.error("Error fetching wallet NFTs:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch wallet NFTs" }, { status: 500 })
  }
}

// Middleware to verify session token
async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.split(" ")[1]
  const decoded = verifySessionToken(token)

  return decoded
}
