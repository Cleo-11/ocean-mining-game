import { createClient } from "@supabase/supabase-js"

// Capture env vars
const SUPABASE_URL = https://crwkgwghgkypxcoxefid.supabase.co
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd2tnd2doZ2t5cHhjb3hlZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTAwMTksImV4cCI6MjA2NDY4NjAxOX0.gW1d_fcNW24EUU0HZOrc70FlGyjpwcCTKDGB-MjRcxM
const SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd2tnd2doZ2t5cHhjb3hlZmlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTExMDAxOSwiZXhwIjoyMDY0Njg2MDE5fQ.AZnmLQN7AQR43owZ_vPyVm5lnI39bTrp97f-xRamqQc

// Reusable client
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and key must be provided")
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return supabaseClient
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

export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return false
    }

    const client = getSupabaseClient()
    const { error } = await client.from("health_check").select("*").limit(1)

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
