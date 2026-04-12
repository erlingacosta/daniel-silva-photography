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
  user?: {
    id?: number
    email?: string
    full_name?: string
    phone?: string
    bio?: string
    profile_image?: string
    created_at?: string
    role?: string
  }
  booking?: {
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
  messages?: Message[]
  gallery?: GalleryItem[]
  message_count?: number
  gallery_count?: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-800',
  deposit_paid: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const inputCls = "w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
const labelCls = "block text-sm font-medium text-gray-700 mb-1"

export default function AdminClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string

  const [data, setData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit client state
  const [editMode, setEditMode] = useState(false)
  const [editClient, setEditClient] = useState({ full_name: '', email: '', phone: '', role: 'client' })
  const [savingClient, setSavingClient] = useState(false)

  // Password reset state
  const [resettingPw, setResettingPw] = useState(false)
  const [tempPassword, setTempPassword] = useState('')

  // Messages
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Gallery upload
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  useEffect(() => { fetchData() }, [clientId])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [data?.messages])

  async function fetchData() {
    try {
      const res = await adminApi.get(`/admin/clients/${clientId}`)
      setData(res.data)
      const u = res.data?.user || {}
      setEditClient({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '', role: u.role || 'client' })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function saveClientInfo() {
    setSavingClient(true)
    try {
      await adminApi.put(`/admin/clients/${clientId}/info`, editClient)
      setData(prev => prev ? { ...prev, user: { ...prev.user, ...editClient } } : prev)
      setEditMode(false)
      showToast('Client info updated')
    } catch (e) {
      console.error(e)
      showToast('Error saving client info')
    } finally {
      setSavingClient(false)
    }
  }

  async function resetPassword() {
    if (!window.confirm('Generate a temporary password for this client?')) return
    setResettingPw(true)
    setTempPassword('')
    try {
      const res = await adminApi.post(`/admin/clients/${clientId}/reset-password`)
      setTempPassword(res.data.temp_password)
      showToast('Temporary password generated')
    } catch (e) {
      console.error(e)
      showToast('Error generating password')
    } finally {
      setResettingPw(false)
    }
  }

  async function sendMessage() {
    if (!messageText.trim() || !data) return
    setSending(true)
    try {
      const res = await adminApi.post(`/admin/clients/${clientId}/messages`, { content: messageText })
      setData(prev => prev ? { ...prev, messages: [...(prev.messages || []), res.data] } : prev)
      setMessageText('')
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  async function toggleVisibility(photo: GalleryItem) {
    try {
      const res = await adminApi.patch(`/admin/gallery/${photo.id}`, { is_visible: !photo.is_visible })
      setData(prev => prev ? {
        ...prev,
        gallery: (prev.gallery || []).map(g => g.id === photo.id ? { ...g, is_visible: res.data.is_visible } : g)
      } : prev)
    } catch (e) { console.error(e) }
  }

  async function deletePhoto(id: number) {
    if (!window.confirm('Delete this photo?')) return
    try {
      await adminApi.delete(`/admin/gallery/${id}`)
      setData(prev => prev ? { ...prev, gallery: (prev.gallery || []).filter(g => g.id !== id) } : prev)
    } catch (e) { console.error(e) }
  }

  async function uploadPhoto() {
    if (!fileInputRef.current?.files?.[0] || !data) return
    if (!data.booking) { setUploadError('No booking found for this client'); return }
    const file = fileInputRef.current.files[0]
    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', String(data.user?.id))
      formData.append('booking_id', String(data.booking.id))
      if (uploadCaption) formData.append('caption', uploadCaption)
      const res = await adminApi.post('/admin/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const newPhoto = { ...res.data, is_visible: true, created_at: new Date().toISOString() }
      setData(prev => prev ? { ...prev, gallery: [newPhoto, ...(prev.gallery || [])] } : prev)
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

  const user = data?.user || {}
  const booking = data?.booking || null
  const messages = data?.messages || []
  const gallery = data?.gallery || []

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {toast && (
        <div className="px-4 py-3 rounded-lg bg-green-100 text-green-800 border border-green-300 text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Section A — Client Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Client Info</h2>
          <div className="flex gap-2">
            {!editMode && (
              <button onClick={() => setEditMode(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">
                Edit
              </button>
            )}
            <button onClick={resetPassword} disabled={resettingPw}
              className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium disabled:opacity-50">
              {resettingPw ? 'Generating...' : 'Reset Password'}
            </button>
          </div>
        </div>

        {!editMode ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{user.full_name || '—'}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{user.email}</span></div>
            <div><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{user.phone || '—'}</span></div>
            <div><span className="text-gray-500">Role:</span> <span className="font-medium text-gray-900 capitalize">{user.role || 'client'}</span></div>
            {user.bio && (
              <div className="col-span-2"><span className="text-gray-500">Bio:</span> <span className="text-gray-900">{user.bio}</span></div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input value={editClient.full_name} onChange={e => setEditClient(c => ({...c, full_name: e.target.value}))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input value={editClient.email} onChange={e => setEditClient(c => ({...c, email: e.target.value}))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={editClient.phone} onChange={e => setEditClient(c => ({...c, phone: e.target.value}))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <select value={editClient.role} onChange={e => setEditClient(c => ({...c, role: e.target.value}))}
                className={inputCls}>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-1">
              <button onClick={() => setEditMode(false)}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium">Cancel</button>
              <button onClick={saveClientInfo} disabled={savingClient}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
                {savingClient ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Temp password reveal */}
        {tempPassword && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-1">Temporary Password Generated</p>
            <p className="text-sm text-amber-700">Send this to the client — they will be prompted to change it on next login:</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="text-base font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1.5 rounded border border-amber-300">
                {tempPassword}
              </code>
              <button onClick={() => { navigator.clipboard.writeText(tempPassword); showToast('Copied!') }}
                className="text-xs px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded">
                Copy
              </button>
            </div>
          </div>
        )}
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
            <div><span className="text-gray-500">Package:</span> <span className="font-medium text-gray-900">{booking.package_name || '—'}</span></div>
            <div><span className="text-gray-500">Event Date:</span> <span className="font-medium text-gray-900">{booking.event_date ? new Date(booking.event_date).toLocaleDateString() : '—'}</span></div>
            <div><span className="text-gray-500">Event Type:</span> <span className="font-medium text-gray-900">{booking.event_type || '—'}</span></div>
            <div className="col-span-2"><span className="text-gray-500">Location:</span> <span className="font-medium text-gray-900">{booking.event_location || '—'}</span></div>
            <div><span className="text-gray-500">Total Price:</span> <span className="font-medium text-gray-900">${booking.total_price?.toLocaleString() || 0}</span></div>
            <div>
              <span className="text-gray-500">Deposit:</span>{' '}
              <span className={`font-medium ${booking.deposit_paid ? 'text-green-600' : 'text-red-500'}`}>
                {booking.deposit_paid ? 'Paid' : 'Unpaid'} {booking.deposit_amount ? `($${booking.deposit_amount.toLocaleString()})` : ''}
              </span>
            </div>
            {booking.deposit_due_date && (
              <div><span className="text-gray-500">Deposit Due:</span> <span className="text-gray-900">{booking.deposit_due_date}</span></div>
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
            const isAdmin = m.sender_name?.toLowerCase().includes('admin') || m.sender_name?.toLowerCase().includes('daniel')
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
          <textarea rows={2} value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }}}
            className={inputCls + ' flex-1 resize-none'}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)" />
          <button onClick={sendMessage} disabled={sending || !messageText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
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
              <label className="block text-xs text-gray-600 font-medium mb-1">Photo file</label>
              <input ref={fileInputRef} type="file" accept="image/*"
                className="text-sm text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer" />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs text-gray-600 font-medium mb-1">Caption (optional)</label>
              <input value={uploadCaption} onChange={e => setUploadCaption(e.target.value)}
                className={inputCls} placeholder="e.g. First dance" />
            </div>
            <button onClick={uploadPhoto} disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
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
              <div key={photo.id} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={photo.image_url} alt={photo.caption || 'Gallery photo'}
                  className="w-full h-40 object-cover" />
                <div className="p-2">
                  {photo.caption && <p className="text-xs text-gray-700 font-medium truncate mb-1">{photo.caption}</p>}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${photo.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {photo.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => toggleVisibility(photo)}
                        className="text-xs px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium">
                        {photo.is_visible ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => deletePhoto(photo.id)}
                        className="text-xs px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium">
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
