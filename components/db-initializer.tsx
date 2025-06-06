"use client"

import { useState } from "react"

export function DatabaseInitializer() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const initializeDatabase = async () => {
    try {
      setStatus("loading")
      setMessage("Connecting to MongoDB...")

      const response = await fetch("/api/admin/init-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(`Database initialized successfully! MongoDB connected: ${data.mongodbConnected}`)
      } else {
        setStatus("error")
        setMessage(`Error: ${data.error || "Unknown error"}`)
        console.error("Database initialization failed:", data)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("Database initialization error:", error)
    }
  }

  return (
    <div className="rounded-lg bg-slate-800 p-4 shadow-lg">
      <h2 className="mb-4 text-lg font-bold text-cyan-400">Database Connection</h2>

      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`h-3 w-3 rounded-full ${
              status === "idle"
                ? "bg-gray-400"
                : status === "loading"
                  ? "bg-yellow-400 animate-pulse"
                  : status === "success"
                    ? "bg-green-400"
                    : "bg-red-400"
            }`}
          />
          <span className="text-sm text-slate-300">
            {status === "idle"
              ? "Not connected"
              : status === "loading"
                ? "Connecting..."
                : status === "success"
                  ? "Connected"
                  : "Connection failed"}
          </span>
        </div>

        {message && (
          <div
            className={`mt-2 rounded-md p-2 text-xs ${
              status === "error" ? "bg-red-900/30 text-red-300" : "bg-slate-700/50 text-slate-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <button
        onClick={initializeDatabase}
        disabled={status === "loading"}
        className={`w-full rounded-md py-2 text-sm font-medium transition-all ${
          status === "loading"
            ? "bg-slate-600 text-slate-400 cursor-wait"
            : "bg-gradient-to-r from-teal-600 to-cyan-700 text-white hover:shadow-lg"
        }`}
      >
        {status === "loading" ? "Connecting..." : "Initialize Database"}
      </button>

      <div className="mt-3 text-xs text-slate-400">
        <p>This will create the necessary collections and indexes in MongoDB.</p>
        <p className="mt-1">
          Make sure your <code className="rounded bg-slate-700 px-1">MONGODB_URI</code> environment variable is set.
        </p>
      </div>
    </div>
  )
}
