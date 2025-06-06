import { type NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "@/lib/auth-service"
import { getPlayerProgress, updatePlayerProgress } from "@/lib/db-service"

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

// Get player progress
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const playerProgress = await getPlayerProgress(user.walletAddress)

    if (!playerProgress) {
      return NextResponse.json({ error: "Player progress not found" }, { status: 404 })
    }

    return NextResponse.json(playerProgress)
  } catch (error: any) {
    console.error("Error fetching player progress:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch player progress" }, { status: 500 })
  }
}

// Update player progress
export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAuth(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate update data
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 })
    }

    // Update player progress
    const result = await updatePlayerProgress(user.walletAddress, body)

    return NextResponse.json({
      message: "Player progress updated successfully",
      playerProgress: result,
    })
  } catch (error: any) {
    console.error("Error updating player progress:", error)
    return NextResponse.json({ error: error.message || "Failed to update player progress" }, { status: 500 })
  }
}
