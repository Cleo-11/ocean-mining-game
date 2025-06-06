"use client"

import { useState, useEffect } from "react"
import { isMoralisAvailable } from "@/lib/moralis-service"

export function MoralisStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const checkMoralisStatus = async () => {
      try {
        const isAvailable = await isMoralisAvailable()

        if (isAvailable) {
          setStatus("connected")
          setMessage("Moralis connected")
        } else {
          setStatus("error")
          setMessage("Moralis connection failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to check Moralis status")
      }
    }

    checkMoralisStatus()
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
          ? "Checking Moralis..."
          : status === "connected"
            ? "Moralis connected"
            : "Using local storage"}
      </span>
    </div>
  )
}
