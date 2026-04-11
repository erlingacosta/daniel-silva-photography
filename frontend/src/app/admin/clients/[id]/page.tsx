'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { adminApi } from '@/lib/api'

interface Message {
  id: number
  content: string
  sender_id: number
  sender_name: string
  is_read: boolean
  created_at: string
}

interface GalleryItem {
  id: number
  image_url: string
  caption: string
  is_visible: boolean
  created_at: string
}

interface ClientData {
  user: {
    id: number
    email: string
    full_name: string
    phone: string
    bio: string
    profile_image: string
    created_at?: string
  }
  booking: {
    id: number
    client_id: number
    package_name: string
    event_date: string | null
    event_type: string
    event_location: string
    status: string
    total_price: number
    deposit_paid: boolean
    deposit_amount: number
    deposit_due_date: string
    contract_notes: string
    internal_notes: string
  } | null
  messages: Message[]
  gallery: GalleryItem[]
  message_count: number
  gallery_count: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-800',
  deposit_paid: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string

  const [data, setData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [clientId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  async function fetchData() {
    try {
      const res = await adminApi.get(`/admin/clients/${clientId}`)
      setData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage() {
    if (!messageText.trim() || !data) return
    setSending(true)
    try {
      const res = await adminApi.post(`/admin/clients/${clientId}/messages`, { content: messageText })
      setData(prev => prev ? { ...prev, messages: [...prev.messages, res.data] } : prev)
      setMessageText('')
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  async function toggleVisibility(photo: GalleryItem) {
    try {
      const res = await adminApi.patch(`/admin/gallery/${photo.id}`, { is_visible: !photo.is_visible })
      setData(prev => prev ? {
        ...prev,
        gallery: prev.gallery.map(g => g.id === photo.id ? { ...g, is_visible: res.data.is_visible } : g)
      } : prev)
    } catch (e) {
      console.error(e)
    }
  }

  async function deletePhoto(id: number) {
    if (!window.confirm('Delete this photo?')) return
    try {
      await adminApi.delete(`/admin/gallery/${id}`)
      setData(prev => prev ? { ...prev, gallery: prev.gallery.filter(g => g.id !== id) } : prev)
    } catch (e) {
      console.error(e)
    }
  }

  async function uploadPhoto() {
    if (!fileInputRef.current?.files?.[0] || !data) return
    const file = fileInputRef.current.files[0]
    if (!data.booking) {
      setUploadError('No booking found for this client')
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', String(data.user.id))
      formData.append('booking_id', String(data.booking.id))
      if (uploadCaption) formData.append('caption', uploadCaption)

      const res = await adminApi.post('/admin/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const newPhoto = { ...res.data, is_visible: true, created_at: new Date().toISOString() }
      setData(prev => prev ? { ...prev, gallery: [newPhoto, ...prev.gallery] } : prev)
      setUploadCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e) {
      setUploadError('Upload failed. Check Spaces credentials.')
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading client...</div>
  if (!data) return <div className="p-8 text-red-500">Client not found</div>

  const { user, booking, messages, gallery } = data
  // Try to get admin id from stored token for bubble direction
  let adminId: number | null = null
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('djs_token')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        adminId = payload.sub || payload.id || null
      }
    } catch {}
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Section A — Client Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Client Info</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{user.full_name || '—'}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{user.email}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{user.phone || '—'}</span></div>
          <div><span className="text-gray-500">Role:</span> <span className="font-medium capitalize">{user.profile_image || 'client'}</span></div>
          {user.bio && (
            <div className="col-span-2"><span className="text-gray-500">Bio:</span> <span>{user.bio}</span></div>
          )}
        </div>
      </div>

      {/* Section B — Booking Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Booking</h2>
        {!booking ? (
          <p className="text-gray-400 text-sm">No booking yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Status:</span>{' '}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <div><span className="text-gray-500">Package:</span> <span className="font-medium">{booking.package_name || '—'}</span></div>
            <div><span className="text-gray-500">Event Date:</span> <span className="font-medium">{booking.event_date ? new Date(booking.event_date).toLocaleDateString() : '—'}</span></div>
            <div><span className="text-gray-500">Event Type:</span> <span className="font-medium">{booking.event_type || '—'}</span></div>
            <div className="col-span-2"><span className="text-gray-500">Location:</span> <span className="font-medium">{booking.event_location || '—'}</span></div>
            <div><span className="text-gray-500">Total Price:</span> <span className="font-medium">${booking.total_price?.toLocaleString() || 0}</span></div>
            <div>
              <span className="text-gray-500">Deposit:</span>{' '}
              <span className={`font-medium ${booking.deposit_paid ? 'text-green-600' : 'text-red-500'}`}>
                {booking.deposit_paid ? 'Paid' : 'Unpaid'} {booking.deposit_amount ? `($${booking.deposit_amount.toLocaleString()})` : ''}
              </span>
            </div>
            {booking.deposit_due_date && (
              <div><span className="text-gray-500">Deposit Due:</span> <span>{booking.deposit_due_date}</span></div>
            )}
            {booking.contract_notes && (
              <div className="col-span-2"><span className="text-gray-500">Contract Notes:</span> <p className="mt-1 text-gray-700">{booking.contract_notes}</p></div>
            )}
            {booking.internal_notes && (
              <div className="col-span-2"><span className="text-gray-500">Internal Notes:</span> <p className="mt-1 text-gray-700">{booking.internal_notes}</p></div>
            )}
          </div>
        )}
      </div>

      {/* Section C — Messages */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto mb-4 pr-1">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No messages yet</p>
          )}
          {messages.map(m => {
            const isAdmin = adminId !== null ? m.sender_id === adminId : m.sender_name?.toLowerCase().includes('admin') || m.sender_name?.toLowerCase().includes('daniel')
            return (
              <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${isAdmin ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-100'}`}>
                  <div className={`text-xs font-medium mb-1 ${isAdmin ? 'text-yellow-700 text-right' : 'text-gray-500'}`}>
                    {m.sender_name}
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{m.content}</p>
                  <div className={`text-xs mt-1 ${isAdmin ? 'text-right text-yellow-600' : 'text-gray-400'}`}>
                    {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }}}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Type a message... (Enter to send)"
          />
          <button onClick={sendMessage} disabled={sending || !messageText.trim()}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Section D — Photo Gallery */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Photo Gallery</h2>

        {/* Upload */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Photo</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Photo file</label>
              <input ref={fileInputRef} type="file" accept="image/*"
                className="text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200" />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs text-gray-500 mb-1">Caption (optional)</label>
              <input value={uploadCaption} onChange={e => setUploadCaption(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm" placeholder="e.g. First dance" />
            </div>
            <button onClick={uploadPhoto} disabled={uploading}
              className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
        </div>

        {/* Grid */}
        {gallery.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No photos yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map(photo => (
              <div key={photo.id} className="group relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={photo.image_url} alt={photo.caption || 'Gallery photo'}
                  className="w-full h-40 object-cover" />
                <div className="p-2">
                  {photo.caption && <p className="text-xs text-gray-600 truncate">{photo.caption}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${photo.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {photo.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => toggleVisibility(photo)}
                        className="text-xs px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded">
                        {photo.is_visible ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => deletePhoto(photo.id)}
                        className="text-xs px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded">
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
