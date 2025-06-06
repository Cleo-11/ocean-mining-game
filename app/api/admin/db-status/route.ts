import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Check if MongoDB URI is configured and valid
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        connected: false,
        error: "MONGODB_URI environment variable not configured",
        configured: false,
      })
    }

    if (!process.env.MONGODB_URI.startsWith("mongodb")) {
      return NextResponse.json({
        connected: false,
        error: "Invalid MongoDB URI format - must start with mongodb:// or mongodb+srv://",
        configured: false,
      })
    }

    // Dynamic import to avoid build-time issues
    const { default: clientPromise } = await import("@/lib/mongodb")

    // Test MongoDB connection
    const client = await clientPromise
    await client.db("admin").command({ ping: 1 })

    return NextResponse.json({
      connected: true,
      configured: true,
      message: "MongoDB connection successful",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Database connection error:", error)

    return NextResponse.json(
      {
        connected: false,
        configured: !!process.env.MONGODB_URI,
        error: error.message || "Failed to connect to MongoDB",
      },
      { status: 500 },
    )
  }
}
