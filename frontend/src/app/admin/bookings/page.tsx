'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Booking {
  id: number
  client_email: string
  package: string
  event_date: string | null
  status: string
  total_price: number
  created_at: string
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(212,175,55,0.1)', color: '#d4af37' },
  confirmed: { bg: 'rgba(40,180,80,0.1)', color: '#66cc88' },
  completed: { bg: 'rgba(80,120,200,0.1)', color: '#88aadd' },
  cancelled: { bg: 'rgba(180,40,40,0.1)', color: '#cc6666' },
}

const ALL_STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<'event_date' | 'created_at' | 'total_price'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('djs_token')
        const res = await axios.get(`${API_URL}/api/admin/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setBookings(res.data)
        setFiltered(res.data)
      } catch {
        // Try the public endpoint as fallback
        try {
          const res = await axios.get(`${API_URL}/api/bookings`)
          setBookings(res.data)
          setFiltered(res.data)
        } catch {
          setError('Could not load bookings. Make sure the backend is running.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  useEffect(() => {
    let result = [...bookings]

    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter)
    }

    result.sort((a, b) => {
      const aVal = a[sortField] ?? ''
      const bVal = b[sortField] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })

    setFiltered(result)
  }, [bookings, statusFilter, sortField, sortDir])

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return d
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const style = STATUS_COLORS[status] || { bg: 'rgba(255,255,255,0.05)', color: '#888' }
    return (
      <span style={{
        padding: '3px 10px',
        backgroundColor: style.bg,
        color: style.color,
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '500',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}>
        {status}
      </span>
    )
  }

  const SortButton = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      style={{ background: 'none', border: 'none', color: sortField === field ? '#d4af37' : '#555', fontSize: '11px', cursor: 'pointer', padding: 0, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      {label}
      {sortField === field && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  )

  const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ color: '#d4af37', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '8px' }}>Management</p>
        <h1 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 'bold' }}>Bookings</h1>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(212,175,55,0.12)', margin: '24px 0' }} />

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(180,40,40,0.1)', border: '1px solid rgba(180,40,40,0.2)', borderRadius: '4px', marginBottom: '20px' }}>
          <p style={{ color: '#cc6666', fontSize: '13px' }}>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {ALL_STATUSES.slice(1).map((s) => {
          const style = STATUS_COLORS[s] || { bg: 'rgba(255,255,255,0.03)', color: '#888' }
          return (
            <div key={s} style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '6px', padding: '16px 20px' }}>
              <p style={{ color: '#555', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{s}</p>
              <p style={{ color: style.color, fontSize: '24px', fontFamily: "'Playfair Display', serif", fontWeight: 'bold' }}>{counts[s] || 0}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 16px',
              backgroundColor: statusFilter === s ? '#d4af37' : 'transparent',
              color: statusFilter === s ? '#0a0a0a' : '#777',
              border: `1px solid ${statusFilter === s ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '3px',
              fontSize: '12px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {s === 'all' ? `All (${bookings.length})` : s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#555', fontSize: '13px' }}>Loading bookings...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#555', fontSize: '14px' }}>No bookings found.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
            padding: '12px 20px',
            borderBottom: '1px solid rgba(212,175,55,0.08)',
            gap: '16px',
          }}>
            <span style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Client</span>
            <span style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Package</span>
            <SortButton field="event_date" label="Event Date" />
            <span style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Status</span>
            <SortButton field="total_price" label="Amount" />
          </div>

          {/* Rows */}
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div>
                <p style={{ color: '#f5f5f5', fontSize: '13px', fontWeight: '500' }}>{booking.client_email}</p>
                <p style={{ color: '#444', fontSize: '11px', marginTop: '2px' }}>#{booking.id} · {formatDate(booking.created_at)}</p>
              </div>
              <p style={{ color: '#888', fontSize: '13px' }}>{booking.package}</p>
              <p style={{ color: '#888', fontSize: '13px' }}>{formatDate(booking.event_date)}</p>
              <StatusBadge status={booking.status} />
              <p style={{ color: '#d4af37', fontSize: '13px', fontWeight: '500' }}>
                {booking.total_price ? `$${booking.total_price.toLocaleString()}` : '—'}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
