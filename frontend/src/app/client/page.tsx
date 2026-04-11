'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientApi } from '@/lib/api'

interface DashboardData {
  user: { full_name: string; email: string; phone: string }
  booking: {
    id: number
    status: string
    event_date: string | null
    event_type: string
    package_name: string | null
    total_price: number
    deposit_paid: boolean
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  confirmed: 'bg-green-500/20 text-green-300 border-green-500/40',
  completed: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/40',
}

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    clientApi.get('/client/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-neutral-400">Loading...</div>
  if (error) return <div className="p-8 text-red-400">{error}</div>
  if (!data) return null

  const statusColor = data.booking ? (STATUS_COLORS[data.booking.status] || STATUS_COLORS.pending) : ''

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-light text-white tracking-wide mb-1">
        Welcome back, {data.user.full_name || data.user.email}
      </h1>
      <p className="text-neutral-500 text-sm mb-8">{data.user.email}</p>

      {data.booking ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Your Booking</h2>
            <span className={`text-xs px-3 py-1 rounded-full border uppercase tracking-wider ${statusColor}`}>
              {data.booking.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {data.booking.event_date && (
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Event Date</p>
                <p className="text-white">{new Date(data.booking.event_date).toLocaleDateString()}</p>
              </div>
            )}
            {data.booking.event_type && (
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Event Type</p>
                <p className="text-white capitalize">{data.booking.event_type}</p>
              </div>
            )}
            {data.booking.package_name && (
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Package</p>
                <p className="text-white">{data.booking.package_name}</p>
              </div>
            )}
            {data.booking.total_price != null && (
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Total Price</p>
                <p className="text-white">${data.booking.total_price.toLocaleString()}</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-800">
            <p className="text-xs text-neutral-500">
              Deposit: {data.booking.deposit_paid ? <span className="text-green-400">Paid</span> : <span className="text-yellow-400">Pending</span>}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
          <p className="text-neutral-400 text-sm">No booking found. Contact Daniel to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link href="/client/messages" className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-amber-500/50 transition group">
          <p className="text-white font-medium group-hover:text-amber-400 transition">Messages</p>
          <p className="text-neutral-500 text-sm mt-1">Chat with Daniel about your event</p>
        </Link>
        <Link href="/client/gallery" className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-amber-500/50 transition group">
          <p className="text-white font-medium group-hover:text-amber-400 transition">Gallery</p>
          <p className="text-neutral-500 text-sm mt-1">View your private photo gallery</p>
        </Link>
      </div>
    </div>
  )
}
