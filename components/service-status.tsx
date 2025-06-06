"use client"

import { useState, useEffect } from "react"
import { getServiceStatus } from "@/lib/db-service"

export function ServiceStatus() {
  const [status, setStatus] = useState<{
    supabase: boolean
    moralis: boolean
    usingLocalStorage: boolean
  }>({
    supabase: false,
    moralis: false,
    usingLocalStorage: true,
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const serviceStatus = await getServiceStatus()
        setStatus(serviceStatus)
      } catch (error) {
        console.error("Failed to check service status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-xs text-slate-300">Checking services...</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${status.moralis ? "bg-green-400" : "bg-red-400"}`} />
        <span className="text-xs text-slate-300">Moralis: {status.moralis ? "Connected" : "Disconnected"}</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${status.supabase ? "bg-green-400" : "bg-red-400"}`} />
        <span className="text-xs text-slate-300">Supabase: {status.supabase ? "Connected" : "Disconnected"}</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${!status.usingLocalStorage ? "bg-green-400" : "bg-yellow-400"}`} />
        <span className="text-xs text-slate-300">
          Storage: {!status.usingLocalStorage ? "Database" : "Local Storage"}
        </span>
      </div>
    </div>
  )
}
