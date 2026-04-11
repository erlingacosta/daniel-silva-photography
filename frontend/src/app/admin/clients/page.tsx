'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface ClientBooking {
  id: number
  status: string
  event_date: string | null
  event_type: string
  package_name: string
}

interface Client {
  id: number
  email: string
  full_name: string
  phone: string
  role: string
  created_at: string | null
  booking: ClientBooking | null
}

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(234,179,8,0.15)',   color: '#eab308' },
  confirmed: { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  completed: { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status || 'none'
  const style = statusColors[s] || { bg: 'rgba(100,100,100,0.15)', color: '#888' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '3px',
      fontSize: '11px',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontWeight: 500,
      backgroundColor: style.bg,
      color: style.color,
    }}>
      {s === 'none' ? 'No Booking' : s}
    </span>
  )
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.get('/admin/clients')
      .then(r => setClients(r.data))
      .catch(() => setError('Failed to load clients'))
      .finally(() => setLoading(false))
  }, [])

  const th: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555',
    borderBottom: '1px solid rgba(212,175,55,0.1)',
    fontWeight: 500,
  }
  const td: React.CSSProperties = {
    padding: '13px 14px',
    fontSize: '13px',
    color: '#ccc',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    verticalAlign: 'middle',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ color: '#d4af37', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Admin
        </p>
        <h1 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 'bold' }}>
          Clients
        </h1>
      </div>

      {loading && <p style={{ color: '#555', fontSize: '13px' }}>Loading...</p>}
      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

      {!loading && !error && (
        <div style={{
          backgroundColor: '#0d0d0d',
          border: '1px solid rgba(212,175,55,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Full Name</th>
                <th style={th}>Email</th>
                <th style={th}>Phone</th>
                <th style={th}>Role</th>
                <th style={th}>Joined</th>
                <th style={th}>Booking Status</th>
                <th style={th}>Event Date</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...td, color: '#555', textAlign: 'center', padding: '32px' }}>
                    No clients found
                  </td>
                </tr>
              )}
              {clients.map(c => (
                <tr key={c.id} style={{ transition: 'background 0.1s' }}>
                  <td style={{ ...td, color: '#f0f0f0', fontWeight: 500 }}>{c.full_name || '—'}</td>
                  <td style={td}>{c.email}</td>
                  <td style={td}>{c.phone || '—'}</td>
                  <td style={{ ...td }}>
                    <span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {c.role}
                    </span>
                  </td>
                  <td style={{ ...td, fontSize: '12px', color: '#666' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={td}>
                    <StatusBadge status={c.booking?.status ?? null} />
                  </td>
                  <td style={{ ...td, fontSize: '12px', color: '#666' }}>
                    {c.booking?.event_date ? new Date(c.booking.event_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={td}>
                    <Link
                      href={`/admin/clients/${c.id}`}
                      style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        border: '1px solid rgba(212,175,55,0.4)',
                        color: '#d4af37',
                        borderRadius: '3px',
                        fontSize: '11px',
                        letterSpacing: '0.06em',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                      }}
                    >
                      View Client
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
