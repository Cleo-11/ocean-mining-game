import { createClient } from "@supabase/supabase-js"

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
