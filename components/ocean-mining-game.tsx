"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"

import { Submarine } from "./submarine"
import { ResourceDisplay } from "./resource-display"
import { UpgradeModal } from "./upgrade-modal"
import { useGame } from "@/contexts/GameContext"
import { useNotification } from "@/contexts/NotificationContext"
import { StorageFullNotification } from "./storage-full-notification"
import { getStorageStatus } from "@/lib/resource-utils"
import { getNextSubmarineTier } from "@/lib/submarine-tiers"

export const OceanMiningGame = () => {
  const { address } = useAccount()
  const {
    resources,
    setResources,
    balance,
    setBalance,
    submarineTier,
    setSubmarineTier,
    playerStats,
    setPlayerStats,
    gameState,
    setGameState,
  } = useGame()
  const { onAddNotification } = useNotification()

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showStorageFullNotification, setShowStorageFullNotification] = useState(false)

  // Start mining when the component mounts
  useEffect(() => {
    if (address) {
      setGameState("idle")
    }
  }, [address, setGameState])

  // Check for full storage
  useEffect(() => {
    const storageStatus = getStorageStatus(resources, playerStats)
    setShowStorageFullNotification(storageStatus.isMaxed && gameState === "idle")
  }, [resources, playerStats, gameState])

  const handleTradeAll = () => {
    // Trade all resources for tokens
    const totalValue = resources.nickel * 10 + resources.cobalt * 18 + resources.copper * 14 + resources.manganese * 25

    setBalance((prev) => prev + totalValue)
    setResources({ nickel: 0, cobalt: 0, copper: 0, manganese: 0 })
    setGameState("resourceTraded")
    setShowStorageFullNotification(false)

    onAddNotification(`Traded all resources for ${totalValue} OCE tokens!`, "success")

    setTimeout(() => setGameState("idle"), 1000)
  }

  const handleUpgradeFromNotification = () => {
    setShowStorageFullNotification(false)
    setShowUpgradeModal(true)
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <div className="absolute top-4 left-4">
        <ResourceDisplay
          nickel={resources.nickel}
          cobalt={resources.cobalt}
          copper={resources.copper}
          manganese={resources.manganese}
          balance={balance}
        />
      </div>

      <Submarine />

      {/* Upgrade Modal */}
      <UpgradeModal show={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      {/* Notification */}
      {/* <Notification /> */}

      {/* Storage Full Notification */}
      {showStorageFullNotification && (
        <StorageFullNotification
          onUpgrade={handleUpgradeFromNotification}
          onTrade={handleTradeAll}
          canUpgrade={!!getNextSubmarineTier(submarineTier)}
          nextTierName={getNextSubmarineTier(submarineTier)?.name}
        />
      )}
    </main>
  )
}
