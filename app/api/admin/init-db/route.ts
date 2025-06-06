import { type NextRequest, NextResponse } from "next/server"

// This route should be protected in production!
export async function POST(req: NextRequest) {
  try {
    // Check if we have a valid MongoDB URI
    if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.startsWith("mongodb")) {
      return NextResponse.json(
        {
          error: "MongoDB URI not configured",
          details: "Please set MONGODB_URI environment variable with a valid MongoDB connection string",
          mongodbConnected: false,
        },
        { status: 400 },
      )
    }

    // In production, you should check for admin credentials
    const adminKey = req.headers.get("x-admin-key")

    // Dynamic import to avoid build-time issues
    const { getKey } = await import("@/lib/key-manager")
    const validAdminKey = getKey("ADMIN_SECRET_KEY")

    if (process.env.NODE_ENV === "production" && adminKey !== validAdminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Dynamic import to avoid build-time MongoDB connection
    const { default: clientPromise } = await import("@/lib/mongodb")
    const { initializeDatabase } = await import("@/lib/db-service")

    // Test MongoDB connection first
    console.log("🔗 Testing MongoDB connection...")
    const client = await clientPromise
    await client.db("admin").command({ ping: 1 })
    console.log("✅ MongoDB connection successful")

    // Initialize the database
    console.log("🚀 Initializing database...")
    const result = await initializeDatabase()

    return NextResponse.json({
      success: result,
      message: "Database initialized successfully",
      mongodbConnected: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Database initialization error:", error)

    // Provide more specific error messages
    let errorMessage = "Failed to initialize database"
    if (error.message?.includes("MONGODB_URI")) {
      errorMessage = "MongoDB URI not configured properly"
    } else if (error.message?.includes("authentication")) {
      errorMessage = "MongoDB authentication failed"
    } else if (error.message?.includes("network")) {
      errorMessage = "Network error connecting to MongoDB"
    } else if (error.message?.includes("Invalid scheme")) {
      errorMessage = "Invalid MongoDB connection string format"
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        mongodbConnected: false,
      },
      { status: 500 },
    )
  }
}
