"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useMultiplayerStore } from "../lib/multiplayer-service"
import { Send, MessageCircle, X } from "lucide-react"

export function MultiplayerChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { chatMessages, sendChatMessage, connected, players } = useMultiplayerStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && connected) {
      sendChatMessage(message.trim())
      setMessage("")
    }
  }

  if (!connected) return null

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full transition-all ${
          isOpen ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"
        } text-white shadow-lg`}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        {chatMessages.length > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {chatMessages.length > 9 ? "9+" : chatMessages.length}
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 h-96 bg-slate-800/95 backdrop-blur-sm rounded-lg border border-cyan-600 flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-cyan-400 font-medium">Ocean Chat</h3>
            <span className="text-xs text-slate-400">{players.length + 1} captains online</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8">
                No messages yet. Say hello to other captains!
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-medium min-w-0 flex-shrink-0">{msg.sender}:</span>
                    <span className="text-slate-200 break-words">{msg.text}</span>
                  </div>
                  <div className="text-xs text-slate-500 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
