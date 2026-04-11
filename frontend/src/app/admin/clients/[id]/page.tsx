'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface ClientUser {
  id: number
  email: string
  full_name: string
  phone: string
  bio: string
  profile_image: string
}

interface BookingInfo {
  id: number
  client_id: number
  package_id: number
  package_name: string
  event_date: string | null
  event_type: string
  event_location: string
  status: string
  total_price: number
  deposit_paid: boolean
  notes: string
}

interface MessageItem {
  id: number
  content: string
  sender_id: number
  sender_name: string
  is_read: boolean
  created_at: string | null
}

interface GalleryItem {
  id: number
  image_url: string
  caption: string
  is_visible: boolean
  created_at: string | null
}

interface ClientDetail {
  user: ClientUser
  booking: BookingInfo | null
  message_count: number
  gallery_count: number
  messages: MessageItem[]
  gallery: GalleryItem[]
}

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(234,179,8,0.15)',   color: '#eab308' },
  confirmed: { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  completed: { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
}

export default function AdminClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string

  const [data, setData] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Messaging
  const [msgText, setMsgText] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Gallery upload
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')

  const fetchData = () => {
    adminApi.get(`/admin/clients/${clientId}`)
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load client'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [clientId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  const sendMessage = async () => {
    if (!msgText.trim() || !data) return
    setSendingMsg(true)
    try {
      const res = await adminApi.post(`/admin/clients/${clientId}/messages`, { content: msgText.trim() })
      setData(prev => prev ? { ...prev, messages: [...prev.messages, res.data] } : prev)
      setMsgText('')
    } catch {
      alert('Failed to send message')
    } finally {
      setSendingMsg(false)
    }
  }

  const toggleVisibility = async (photoId: number, current: boolean) => {
    try {
      await adminApi.patch(`/admin/gallery/${photoId}`, { is_visible: !current })
      setData(prev => prev ? {
        ...prev,
        gallery: prev.gallery.map(g => g.id === photoId ? { ...g, is_visible: !current } : g)
      } : prev)
    } catch {
      alert('Failed to update visibility')
    }
  }

  const deletePhoto = async (photoId: number) => {
    if (!confirm('Delete this photo?')) return
    try {
      await adminApi.delete(`/admin/gallery/${photoId}`)
      setData(prev => prev ? {
        ...prev,
        gallery: prev.gallery.filter(g => g.id !== photoId),
        gallery_count: prev.gallery_count - 1,
      } : prev)
    } catch {
      alert('Failed to delete photo')
    }
  }

  const uploadPhoto = async () => {
    if (!uploadFile || !data?.booking) return
    setUploading(true)
    setUploadStatus('')
    try {
      const form = new FormData()
      form.append('file', uploadFile)
      form.append('user_id', String(data.user.id))
      form.append('booking_id', String(data.booking.id))
      if (uploadCaption) form.append('caption', uploadCaption)
      const res = await adminApi.post('/admin/gallery/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const newItem: GalleryItem = { ...res.data, is_visible: true, created_at: new Date().toISOString() }
      setData(prev => prev ? {
        ...prev,
        gallery: [newItem, ...prev.gallery],
        gallery_count: prev.gallery_count + 1,
      } : prev)
      setUploadFile(null)
      setUploadCaption('')
      setUploadStatus('Uploaded successfully!')
    } catch {
      setUploadStatus('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const card: React.CSSProperties = {
    backgroundColor: '#0d0d0d',
    border: '1px solid rgba(212,175,55,0.1)',
    borderRadius: '4px',
    padding: '24px',
    marginBottom: '20px',
  }

  const label: React.CSSProperties = {
    color: '#555',
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '4px',
  }

  const value: React.CSSProperties = {
    color: '#ccc',
    fontSize: '14px',
    marginBottom: '14px',
  }

  const sectionTitle: React.CSSProperties = {
    color: '#d4af37',
    fontSize: '11px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: '16px',
    fontWeight: 500,
  }

  if (loading) return (
    <div style={{ padding: '48px', color: '#555', fontSize: '13px' }}>Loading...</div>
  )
  if (error || !data) return (
    <div style={{ padding: '48px', color: '#ef4444', fontSize: '13px' }}>{error || 'Client not found'}</div>
  )

  const adminSenderId = data.messages.find(m => m.sender_id !== data.user.id)?.sender_id

  return (
    <div style={{ padding: '32px', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <Link href="/admin/clients" style={{ color: '#555', fontSize: '12px', textDecoration: 'none', letterSpacing: '0.06em' }}>
          ← Clients
        </Link>
        <h1 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>
          {data.user.full_name || data.user.email}
        </h1>
        <p style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>{data.user.email}</p>
      </div>

      {/* Client Info */}
      <div style={card}>
        <p style={sectionTitle}>Client Info</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <div>
            <p style={label}>Full Name</p>
            <p style={value}>{data.user.full_name || '—'}</p>
          </div>
          <div>
            <p style={label}>Email</p>
            <p style={value}>{data.user.email || '—'}</p>
          </div>
          <div>
            <p style={label}>Phone</p>
            <p style={value}>{data.user.phone || '—'}</p>
          </div>
          <div>
            <p style={label}>Bio</p>
            <p style={value}>{data.user.bio || '—'}</p>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      {data.booking ? (
        <div style={card}>
          <p style={sectionTitle}>Booking Info</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
            <div>
              <p style={label}>Event Date</p>
              <p style={value}>{data.booking.event_date ? new Date(data.booking.event_date).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p style={label}>Event Type</p>
              <p style={value}>{data.booking.event_type || '—'}</p>
            </div>
            <div>
              <p style={label}>Location</p>
              <p style={value}>{data.booking.event_location || '—'}</p>
            </div>
            <div>
              <p style={label}>Package</p>
              <p style={value}>{data.booking.package_name || '—'}</p>
            </div>
            <div>
              <p style={label}>Status</p>
              <div style={{ marginBottom: '14px' }}>
                {(() => {
                  const s = data.booking!.status
                  const style = statusColors[s] || { bg: 'rgba(100,100,100,0.15)', color: '#888' }
                  return (
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      backgroundColor: style.bg,
                      color: style.color,
                    }}>
                      {s}
                    </span>
                  )
                })()}
              </div>
            </div>
            <div>
              <p style={label}>Total Price</p>
              <p style={value}>${data.booking.total_price?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p style={label}>Deposit Paid</p>
              <p style={value}>{data.booking.deposit_paid ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...card, color: '#555', fontSize: '13px' }}>No booking on record for this client.</div>
      )}

      {/* Messages */}
      <div style={card}>
        <p style={sectionTitle}>Messages ({data.message_count})</p>

        {/* Chat thread */}
        <div style={{
          maxHeight: '360px',
          overflowY: 'auto',
          marginBottom: '16px',
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {data.messages.length === 0 && (
            <p style={{ color: '#444', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No messages yet</p>
          )}
          {data.messages.map(m => {
            const isAdmin = m.sender_id !== data.user.id
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 14px',
                  borderRadius: isAdmin ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  backgroundColor: isAdmin ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isAdmin ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <p style={{ fontSize: '10px', color: '#666', marginBottom: '4px', letterSpacing: '0.05em' }}>
                    {m.sender_name} &middot; {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                  </p>
                  <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.5 }}>{m.content}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Send form */}
        {data.booking ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type a message... (Enter to send)"
              rows={2}
              style={{
                flex: 1,
                backgroundColor: '#111',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '4px',
                color: '#ccc',
                padding: '10px 14px',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sendingMsg || !msgText.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: sendingMsg || !msgText.trim() ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.2)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#d4af37',
                borderRadius: '4px',
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: sendingMsg || !msgText.trim() ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-end',
              }}
            >
              {sendingMsg ? 'Sending...' : 'Send'}
            </button>
          </div>
        ) : (
          <p style={{ color: '#444', fontSize: '12px' }}>Client needs a booking before messages can be sent.</p>
        )}
      </div>

      {/* Photo Gallery */}
      <div style={card}>
        <p style={sectionTitle}>Photo Gallery ({data.gallery_count})</p>

        {/* Existing photos grid */}
        {data.gallery.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            {data.gallery.map(g => (
              <div key={g.id} style={{
                backgroundColor: '#111',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.image_url}
                  alt={g.caption || 'Gallery photo'}
                  style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '10px' }}>
                  {g.caption && (
                    <p style={{ color: '#888', fontSize: '11px', marginBottom: '8px', lineHeight: 1.4 }}>{g.caption}</p>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => toggleVisibility(g.id, g.is_visible)}
                      style={{
                        flex: 1,
                        padding: '5px',
                        backgroundColor: g.is_visible ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,100,0.1)',
                        border: `1px solid ${g.is_visible ? 'rgba(34,197,94,0.3)' : 'rgba(100,100,100,0.2)'}`,
                        color: g.is_visible ? '#22c55e' : '#666',
                        borderRadius: '3px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {g.is_visible ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => deletePhoto(g.id)}
                      style={{
                        padding: '5px 8px',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444',
                        borderRadius: '3px',
                        fontSize: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#444', fontSize: '13px', marginBottom: '24px' }}>No photos uploaded yet.</p>
        )}

        {/* Upload form */}
        {data.booking ? (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '20px',
          }}>
            <p style={{ color: '#888', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Upload Photo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={e => setUploadFile(e.target.files?.[0] || null)}
                style={{
                  color: '#888',
                  fontSize: '12px',
                  backgroundColor: '#111',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              />
              <input
                type="text"
                value={uploadCaption}
                onChange={e => setUploadCaption(e.target.value)}
                placeholder="Caption (optional)"
                style={{
                  backgroundColor: '#111',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: '4px',
                  color: '#ccc',
                  padding: '9px 14px',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={uploadPhoto}
                  disabled={!uploadFile || uploading || !data.booking}
                  style={{
                    padding: '9px 22px',
                    backgroundColor: !uploadFile || uploading ? 'rgba(212,175,55,0.06)' : 'rgba(212,175,55,0.18)',
                    border: '1px solid rgba(212,175,55,0.35)',
                    color: '#d4af37',
                    borderRadius: '4px',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: !uploadFile || uploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {uploadStatus && (
                  <p style={{
                    fontSize: '12px',
                    color: uploadStatus.includes('success') ? '#22c55e' : '#ef4444',
                  }}>
                    {uploadStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: '#444', fontSize: '12px' }}>Client needs a booking before photos can be uploaded.</p>
        )}
      </div>
    </div>
  )
}
