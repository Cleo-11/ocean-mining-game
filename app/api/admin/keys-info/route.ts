import { type NextRequest, NextResponse } from "next/server"
import { getSecurityKeys } from "@/lib/key-manager"

export async function GET(req: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  try {
    const keys = getSecurityKeys()

    // Don't return the actual keys, just info about them
    const keyInfo = {
      jwtSecretSource: process.env.JWT_SECRET ? "environment" : "generated/file",
      adminKeySource: process.env.ADMIN_SECRET_KEY ? "environment" : "generated/file",
      jwtSecretLength: keys.JWT_SECRET.length,
      adminKeyLength: keys.ADMIN_SECRET_KEY.length,
      keysGenerated: !process.env.JWT_SECRET || !process.env.ADMIN_SECRET_KEY,
    }

    // Only show actual keys in development if explicitly requested
    const showKeys = req.nextUrl.searchParams.get("show") === "true"

    if (showKeys) {
      return NextResponse.json({
        ...keyInfo,
        keys: {
          JWT_SECRET: keys.JWT_SECRET,
          ADMIN_SECRET_KEY: keys.ADMIN_SECRET_KEY,
        },
        warning: "These keys are only shown in development mode",
      })
    }

    return NextResponse.json({
      ...keyInfo,
      message: "Add ?show=true to see actual keys (development only)",
    })
  } catch (error: any) {
    console.error("Error getting keys info:", error)
    return NextResponse.json({ error: error.message || "Failed to get keys info" }, { status: 500 })
  }
}
