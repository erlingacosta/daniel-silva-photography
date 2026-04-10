'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string
  message: string
  status: string
  created_at: string
}

export default function ContactPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchMessages()
  }, [router])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/admin/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data)
      setError('')
    } catch (err) {
      setError('Error loading messages')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Contact Messages</h1>
            <p className="text-slate-400">Manage inquiries from website visitors</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="md:col-span-2">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold">Messages ({messages.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {messages.map(msg => (
                      <tr
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className={`cursor-pointer hover:bg-slate-700 transition-colors ${
                          selectedMessage?.id === msg.id ? 'bg-slate-700' : ''
                        }`}
                      >
                        <td className="px-6 py-3 text-sm">{msg.name}</td>
                        <td className="px-6 py-3 text-sm">{msg.email}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            msg.status === 'new'
                              ? 'bg-blue-900 text-blue-100'
                              : msg.status === 'read'
                              ? 'bg-yellow-900 text-yellow-100'
                              : 'bg-green-900 text-green-100'
                          }`}>
                            {msg.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-400">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Message Details */}
          {selectedMessage && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Message Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Name</p>
                  <p className="text-white font-semibold">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-semibold break-all">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Phone</p>
                  <p className="text-white font-semibold">{selectedMessage.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Message</p>
                  <p className="text-white text-sm mt-2 p-3 bg-slate-700 rounded whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Received</p>
                  <p className="text-white text-sm">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Your Contact Form Submission`}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-center block"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
