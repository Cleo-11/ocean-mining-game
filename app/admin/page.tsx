"use client"

import { useState, useEffect } from "react"
import { ServiceStatus } from "@/components/service-status"
<<<<<<< HEAD
import { DebugEnv } from "@/components/debug-env"
=======
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
import { validateAdminKey, getDefaultAdminKey } from "@/lib/admin-config"

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [showDefaultKey, setShowDefaultKey] = useState(false)

  const handleAuthenticate = async () => {
    if (!adminKey) {
      setAuthError("Please enter the admin key")
      return
    }

    try {
      const isValid = validateAdminKey(adminKey)
      if (isValid) {
        setIsAuthenticated(true)
        setAuthError("")
        localStorage.setItem("admin-authenticated", "true")
      } else {
        setAuthError("Invalid admin key")
      }
    } catch (error) {
      setAuthError("Authentication failed")
      console.error("Auth error:", error)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminKey("")
    localStorage.removeItem("admin-authenticated")
  }

  // Check if already authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("admin-authenticated")
    if (isAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const defaultKey = getDefaultAdminKey()

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">Ocean Mining Admin</h1>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>

<<<<<<< HEAD
        {/* Debug Section - Always Show */}
        <div className="mb-6">
          <DebugEnv />
        </div>

=======
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
        {!isAuthenticated ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-slate-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-slate-200">Authentication Required</h2>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">Admin Key</label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAuthenticate()}
                  className="w-full rounded-lg bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter admin key"
                />
                {authError && <p className="mt-2 text-sm text-red-400">{authError}</p>}
              </div>

              <button
                onClick={handleAuthenticate}
                className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-cyan-700 py-2 font-medium text-white shadow-md transition-all hover:shadow-lg mb-4"
              >
                Authenticate
              </button>

              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Need the admin key?</span>
                  <button
                    onClick={() => setShowDefaultKey(!showDefaultKey)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    {showDefaultKey ? "Hide" : "Show"} Default Key
                  </button>
                </div>

                {showDefaultKey && (
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-xs text-slate-300 mb-2">Default Admin Key:</p>
                    <code className="text-sm text-cyan-400 bg-slate-800 px-2 py-1 rounded">{defaultKey}</code>
                    <p className="text-xs text-slate-400 mt-2">
                      💡 In production, set ADMIN_SECRET_KEY environment variable
                    </p>
                  </div>
                )}
              </div>
            </div>
<<<<<<< HEAD
=======

            <div className="rounded-lg bg-slate-800 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-200 mb-3">🔐 Admin Key Options</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="bg-slate-700 p-3 rounded">
                  <strong className="text-cyan-400">Option 1: Default Key</strong>
                  <p>
                    Use the default key: <code className="bg-slate-800 px-1 rounded">ocean-mining-admin-2024</code>
                  </p>
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  <strong className="text-cyan-400">Option 2: Environment Variable</strong>
                  <p>
                    Set <code className="bg-slate-800 px-1 rounded">ADMIN_SECRET_KEY</code> in your environment
                  </p>
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  <strong className="text-cyan-400">Option 3: Public Admin Key</strong>
                  <p>
                    Set <code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_ADMIN_KEY</code> for client-side access
                  </p>
                </div>
              </div>
            </div>
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg bg-green-900/20 border border-green-500/30 p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 font-medium">Admin Access Granted</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-slate-200">Service Status</h2>
              <ServiceStatus />
            </div>

            <div className="rounded-lg bg-slate-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-slate-200">Environment Variables</h2>
              <div className="space-y-2">
                <div className="rounded-md bg-slate-700 p-3">
                  <div className="text-sm font-medium text-cyan-400">NEXT_PUBLIC_MORALIS_API_KEY</div>
                  <div className="mt-1 text-xs text-slate-300">
                    {process.env.NEXT_PUBLIC_MORALIS_API_KEY ? "✅ Set" : "❌ Not set"}
                  </div>
                </div>
                <div className="rounded-md bg-slate-700 p-3">
                  <div className="text-sm font-medium text-cyan-400">NEXT_PUBLIC_SUPABASE_URL</div>
                  <div className="mt-1 text-xs text-slate-300">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set"}
                  </div>
                </div>
                <div className="rounded-md bg-slate-700 p-3">
                  <div className="text-sm font-medium text-cyan-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                  <div className="mt-1 text-xs text-slate-300">
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set"}
                  </div>
                </div>
                <div className="rounded-md bg-slate-700 p-3">
                  <div className="text-sm font-medium text-cyan-400">ADMIN_SECRET_KEY</div>
                  <div className="mt-1 text-xs text-slate-300">
                    {process.env.ADMIN_SECRET_KEY ? "✅ Set (Custom)" : "⚠️ Using Default"}
                  </div>
                </div>
              </div>
            </div>
<<<<<<< HEAD
=======

            <div className="rounded-lg bg-slate-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-slate-200">Setup Instructions</h2>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-md bg-slate-700 p-3">
                  <h3 className="font-bold text-cyan-400">1. Moralis Setup</h3>
                  <p>
                    Visit{" "}
                    <a
                      href="https://moralis.io"
                      className="text-cyan-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      moralis.io
                    </a>{" "}
                    and create an account
                  </p>
                  <p>Create a new project and copy your API key</p>
                  <p>
                    Add to your environment variables:{" "}
                    <code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_MORALIS_API_KEY</code>
                  </p>
                </div>

                <div className="rounded-md bg-slate-700 p-3">
                  <h3 className="font-bold text-cyan-400">2. Supabase Setup</h3>
                  <p>
                    Visit{" "}
                    <a
                      href="https://supabase.com"
                      className="text-cyan-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      supabase.com
                    </a>{" "}
                    and create an account
                  </p>
                  <p>Create a new project and get your URL and anon key</p>
                  <p>Add to your environment variables:</p>
                  <code className="block mt-1 p-2 bg-slate-800 rounded text-xs">
                    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
                    <br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                    <br />
                    SUPABASE_SERVICE_KEY=your_supabase_service_key
                  </code>
                </div>

                <div className="rounded-md bg-slate-700 p-3">
                  <h3 className="font-bold text-cyan-400">3. Secure Admin Access</h3>
                  <p>For production, set a custom admin key:</p>
                  <code className="block mt-1 p-2 bg-slate-800 rounded text-xs">
                    ADMIN_SECRET_KEY=your_secure_admin_key_here
                  </code>
                </div>
              </div>
            </div>
>>>>>>> ba7937c81170947343fcf8fd889dd9363e8af04e
          </div>
        )}
      </div>
    </div>
  )
}
