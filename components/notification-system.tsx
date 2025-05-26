"use client"

import { useState, useEffect } from "react"

interface Notification {
  id: string
  message: string
  type: "info" | "success" | "warning" | "error"
  duration: number
}

interface NotificationSystemProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function NotificationSystem({ notifications, onDismiss }: NotificationSystemProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onDismiss: (id: string) => void
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss(notification.id), 300) // Wait for animation to complete
    }, notification.duration)

    return () => clearTimeout(timer)
  }, [notification, onDismiss])

  const getTypeStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-gradient-to-r from-green-600 to-green-500 border-green-700"
      case "warning":
        return "bg-gradient-to-r from-yellow-600 to-yellow-500 border-yellow-700"
      case "error":
        return "bg-gradient-to-r from-red-600 to-red-500 border-red-700"
      default:
        return "bg-gradient-to-r from-cyan-600 to-cyan-500 border-cyan-700"
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "warning":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )
      case "error":
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  return (
    <div
      className={`pointer-events-auto flex w-80 transform items-center rounded-lg border shadow-lg transition-all duration-300 ${getTypeStyles()} ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex-shrink-0 p-3 text-white">{getIcon()}</div>
      <div className="flex-1 p-3 text-white">{notification.message}</div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onDismiss(notification.id), 300)
        }}
        className="flex-shrink-0 p-3 text-white hover:text-gray-200 focus:outline-none"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
