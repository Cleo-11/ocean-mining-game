"use client"

import { useState, useEffect } from "react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch("/api/admin/db-status")
        const data = await response.json()

        if (response.ok && data.connected) {
          setStatus("connected")
          setMessage("MongoDB connected")
        } else {
          setStatus("error")
          setMessage(data.error || "Database connection failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to check database status")
      }
    }

    checkDatabaseStatus()
  }, [])

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`h-2 w-2 rounded-full ${
          status === "checking" ? "bg-yellow-400" : status === "connected" ? "bg-green-400" : "bg-red-400"
        }`}
      />
      <span className="text-xs text-slate-300">
        {status === "checking"
          ? "Checking database..."
          : status === "connected"
            ? "Database connected"
            : "Database error"}
      </span>
    </div>
  )
}
