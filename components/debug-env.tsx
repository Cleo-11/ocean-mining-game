"use client"

import { useState } from "react"

export function DebugEnv() {
  const [showDebug, setShowDebug] = useState(false)

  // ✅ These will be captured at build time
  const envVars = {
    NEXT_PUBLIC_MORALIS_API_KEY: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_RESOURCE_SERVER_URL: process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL,
    NEXT_PUBLIC_MULTIPLAYER_SERVER_URL: process.env.NEXT_PUBLIC_MULTIPLAYER_SERVER_URL,
  }

  return (
    <div className="rounded-lg bg-yellow-900/20 border border-yellow-500/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-yellow-400 font-medium">🔍 Debug Environment Variables</h3>
        <button onClick={() => setShowDebug(!showDebug)} className="text-xs text-yellow-400 hover:underline">
          {showDebug ? "Hide" : "Show"} Debug Info
        </button>
      </div>

      {showDebug && (
        <div className="mt-3 space-y-2">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-yellow-300">{key}:</span>
              <span className={value ? "text-green-400" : "text-red-400"}>
                {value ? `✅ ${value.substring(0, 20)}...` : "❌ Not set"}
              </span>
            </div>
          ))}

          <div className="mt-3 p-2 bg-slate-800 rounded text-xs">
            <div className="text-yellow-300">Build-time Environment Check:</div>
            <div className="text-slate-300">
              Variables captured: {Object.values(envVars).filter(Boolean).length} / {Object.keys(envVars).length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
