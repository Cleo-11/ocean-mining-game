import { type NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "@/lib/auth-service"
import { getWalletTokens } from "@/lib/db-service"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const chain = searchParams.get("chain") || "eth"

    const tokens = await getWalletTokens(user.walletAddress, chain)

    return NextResponse.json({ tokens })
  } catch (error: any) {
    console.error("Error fetching wallet tokens:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch wallet tokens" }, { status: 500 })
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
