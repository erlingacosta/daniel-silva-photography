'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'

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

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('djs_token')
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBookings(response.data)
      setFiltered(response.data)
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
    if (status === 'all') {
      setFiltered(bookings)
    } else {
      setFiltered(bookings.filter(b => b.status === status))
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Bookings</h1>
        <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => handleStatusFilter('all')}
          className={`px-4 py-2 rounded transition-colors ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          All
        </button>
        {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={`px-4 py-2 rounded transition-colors capitalize ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Client Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Package</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Event Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Total Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-3 text-sm">{booking.id}</td>
                  <td className="px-6 py-3 text-sm">{booking.client_email}</td>
                  <td className="px-6 py-3 text-sm">{booking.package}</td>
                  <td className="px-6 py-3 text-sm">
                    {booking.event_date ? new Date(booking.event_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      booking.status === 'pending'
                        ? 'bg-yellow-900 text-yellow-100'
                        : booking.status === 'confirmed'
                        ? 'bg-green-900 text-green-100'
                        : booking.status === 'completed'
                        ? 'bg-blue-900 text-blue-100'
                        : 'bg-red-900 text-red-100'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">${booking.total_price.toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 p-8 text-center text-gray-400">
          <p>No bookings found</p>
        </div>
      )}
    </div>
  )
}
