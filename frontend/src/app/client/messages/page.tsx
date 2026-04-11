'use client'

import { useEffect, useRef, useState } from 'react'
import { clientApi } from '@/lib/api'

interface MessageItem {
  id: number
  content: string
  sender_id: number
  sender_name: string
  is_read: boolean
  created_at: string | null
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('client_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setCurrentUserId(user.id)
      } catch {}
    }
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await clientApi.get('/client/messages')
      setMessages(res.data)
    } catch {
      setError('Failed to load messages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setSending(true)
    try {
      const res = await clientApi.post('/client/messages', { content: newMessage.trim() })
      setMessages((prev) => [...prev, res.data])
      setNewMessage('')
    } catch {
      setError('Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="p-8 text-neutral-400">Loading...</div>

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 border-b border-neutral-800">
        <h1 className="text-2xl font-light text-white tracking-wide">Messages</h1>
        <p className="text-neutral-500 text-sm mt-1">Your conversation with Daniel</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {messages.length === 0 && !error && (
          <p className="text-neutral-500 text-sm text-center mt-8">No messages yet. Send Daniel a message below.</p>
        )}
        {messages.map((msg) => {
          const isOwn = currentUserId !== null && msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md rounded-lg px-4 py-3 ${
                isOwn
                  ? 'bg-amber-500 text-black'
                  : 'bg-neutral-800 text-white'
              }`}>
                {!isOwn && (
                  <p className="text-xs font-semibold mb-1 text-neutral-400">{msg.sender_name}</p>
                )}
                <p className="text-sm">{msg.content}</p>
                {msg.created_at && (
                  <p className={`text-xs mt-1 ${isOwn ? 'text-black/60' : 'text-neutral-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' '}
                    {new Date(msg.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-neutral-800 flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm"
        />
        <button
          type="button"
          onClick={fetchMessages}
          className="px-4 py-3 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg border border-neutral-700 text-sm transition"
          title="Refresh"
        >
          ↻
        </button>
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition disabled:opacity-50"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
