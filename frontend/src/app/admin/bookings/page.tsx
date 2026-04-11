'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface Booking {
  id: number
  client_name: string
  client_email: string
  client_phone: string
  package: string
  service_type: string
  event_date: string | null
  event_location: string
  status: string
  price: number
  payment_status: string
  notes: string
  created_at: string | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900 text-yellow-100',
  confirmed: 'bg-green-900 text-green-100',
  completed: 'bg-blue-900 text-blue-100',
  cancelled: 'bg-red-900 text-red-100',
  inquiry: 'bg-gray-700 text-gray-300',
}

const BOOKING_STATUSES = ['inquiry', 'pending', 'confirmed', 'completed', 'cancelled']

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const res = await adminApi.get('/admin/bookings')
      setBookings(res.data)
      setFiltered(res.data)
      setError('')
    } catch (err) {
      setError('Error loading bookings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setFiltered(status === 'all' ? bookings : bookings.filter(b => b.status === status))
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await adminApi.patch(`/admin/bookings/${id}/status`, { status })
      const updated = res.data
      setBookings(prev => prev.map(b => b.id === id ? updated : b))
      setFiltered(prev => prev.map(b => b.id === id ? updated : b))
    } catch (err) {
      alert('Failed to update status')
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return
    try {
      await adminApi.delete(`/admin/bookings/${id}`)
      setBookings(prev => prev.filter(b => b.id !== id))
      setFiltered(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      alert('Failed to delete booking')
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400"><p>Loading bookings...</p></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Bookings</h1>
        <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">← Back to Dashboard</Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">{error}</div>}

      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', ...BOOKING_STATUSES].map(s => (
          <button key={s} onClick={() => handleStatusFilter(s)}
            className={`px-4 py-2 rounded transition-colors capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700">
              <tr>
                {['Name', 'Email', 'Phone', 'Package', 'Service Type', 'Event Date', 'Location', 'Status', 'Price', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">{b.client_name || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{b.client_email || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{b.client_phone || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{b.package || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap capitalize">{b.service_type || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{b.event_date ? new Date(b.event_date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">{b.event_location || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[b.status] || 'bg-gray-700 text-gray-300'}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">${(b.price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2 items-center">
                      <select value={b.status} onChange={e => handleStatusChange(b.id, e.target.value)}
                        className="bg-slate-600 text-white text-xs rounded px-2 py-1 border border-slate-500">
                        {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => handleDelete(b.id)} className="px-2 py-1 bg-red-800 hover:bg-red-700 text-white text-xs rounded transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && <div className="mt-8 p-8 text-center text-gray-400"><p>No bookings found</p></div>}
    </div>
  )
}
