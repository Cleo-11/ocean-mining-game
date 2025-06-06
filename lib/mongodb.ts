import { MongoClient, ServerApiVersion } from "mongodb"

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === "production" && !process.env.VERCEL && !process.env.MONGODB_URI
const isValidUri =
  process.env.MONGODB_URI &&
  (process.env.MONGODB_URI.startsWith("mongodb://") || process.env.MONGODB_URI.startsWith("mongodb+srv://"))

// Log the environment state for debugging
if (typeof window === "undefined") {
  console.log("MongoDB Environment Check:", {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    HAS_MONGODB_URI: !!process.env.MONGODB_URI,
    IS_VALID_URI: isValidUri,
    IS_BUILD_TIME: isBuildTime,
  })
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Only create real MongoDB connection if we have a valid URI and not in build time
if (!isBuildTime && isValidUri) {
  const uri = process.env.MONGODB_URI!
  const options = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
  }

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof global & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  // Test the connection only in runtime
  if (typeof window === "undefined") {
    clientPromise
      .then(() => {
        console.log("✅ MongoDB connected successfully")
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error)
      })
  }
} else {
  // Create a rejected promise for build time or invalid URI
  const errorMessage = isBuildTime
    ? "MongoDB not available during build time"
    : !process.env.MONGODB_URI
      ? "MONGODB_URI environment variable not set"
      : "Invalid MongoDB URI format"

  clientPromise = Promise.reject(new Error(errorMessage))

  if (typeof window === "undefined" && !isBuildTime) {
    console.warn("⚠️ MongoDB not available:", errorMessage)
  }
}

export default clientPromise
