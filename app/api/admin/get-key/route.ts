import { type NextRequest, NextResponse } from "next/server"
import { getKey } from "@/lib/key-manager"

export async function GET(req: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  try {
    const adminKey = getKey("ADMIN_SECRET_KEY")

    return NextResponse.json({
      adminKey,
      message: "This key is only available in development mode",
    })
  } catch (error: any) {
    console.error("Error getting admin key:", error)
    return NextResponse.json({ error: error.message || "Failed to get admin key" }, { status: 500 })
  }
}
