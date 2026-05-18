'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'ai' | 'user'
  text: string
  zh: string
  audioUrl?: string
  score?: number
  isTyping?: boolean
}

interface ChatInterfaceProps {
  messages: Message[]
  isAiTyping: boolean
  onUserMessage: (text: string) => void
  scenario: { titleVi: string; titleZh: string; icon: string }
}

export default function ChatInterface({ messages, isAiTyping, onUserMessage, scenario }: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiTyping])

  return (
    <div className="flex flex-col h-[500px] bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-xl">{scenario.icon}</span>
        <div>
          <p className="font-medium text-sm">{scenario.titleVi}</p>
          <p className="text-xs text-gray-500">{scenario.titleZh}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
                : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
            } px-4 py-3`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {msg.zh}
              </p>
              {msg.score !== undefined && (
                <div className={`text-xs mt-2 pt-2 border-t ${
                  msg.role === 'user' ? 'border-blue-400 text-blue-100' : 'border-gray-100 text-gray-500'
                }`}>
                  发音评分: <span className="font-bold">{msg.score}</span>/100
                </div>
              )}
            </div>
          </div>
        ))}

        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
