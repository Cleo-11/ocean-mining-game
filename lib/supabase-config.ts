import { createClient } from "@supabase/supabase-js"

<<<<<<< HEAD
// ✅ Capture env vars at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

export function createSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are not configured")
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export function createSupabaseServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase service environment variables are not configured")
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

export function getSupabaseConfig() {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    serviceKey: SUPABASE_SERVICE_KEY,
  }
}

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}
=======
// Create a single supabase client for the entire app
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and key must be provided")
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey)
  return supabaseClient
}

export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return false
    }

    const client = getSupabaseClient()
    const { data, error } = await client.from("health_check").select("*").limit(1)

    if (error) {
      console.error("Supabase health check failed:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Failed to check Supabase availability:", error)
    return false
  }
}
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
