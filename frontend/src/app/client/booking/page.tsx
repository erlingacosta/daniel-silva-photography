'use client'

import { useEffect, useState } from 'react'
import { clientApi } from '@/lib/api'

interface BookingDetail {
  id: number
  status: string
  event_date: string | null
  event_type: string
  event_location: string
  notes: string
  total_price: number
  deposit_paid: boolean
  deliverables_ready: boolean
  created_at: string | null
  package: {
    id: number
    name: string
    description: string
    price: number
    deliverables: string
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  confirmed: 'bg-green-500/20 text-green-300 border-green-500/40',
  completed: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/40',
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div>
      <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-sm">{value}</p>
    </div>
  )
}

export default function BookingPage() {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    clientApi.get('/client/booking')
      .then((res) => setBooking(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('No booking found yet.')
        } else {
          setError('Failed to load booking details.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-neutral-400">Loading...</div>
  if (error) return <div className="p-8 text-neutral-400">{error}</div>
  if (!booking) return null

  const statusColor = STATUS_COLORS[booking.status] || STATUS_COLORS.pending

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-white tracking-wide">Booking Details</h1>
        <span className={`text-xs px-3 py-1 rounded-full border uppercase tracking-wider ${statusColor}`}>
          {booking.status}
        </span>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
        <h2 className="text-white font-medium mb-4">Event Information</h2>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Event Date" value={booking.event_date ? new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : null} />
          <Field label="Event Type" value={booking.event_type ? booking.event_type.charAt(0).toUpperCase() + booking.event_type.slice(1) : null} />
          <Field label="Location" value={booking.event_location} />
          <Field label="Booking Created" value={booking.created_at ? new Date(booking.created_at).toLocaleDateString() : null} />
          {booking.notes && <div className="col-span-2"><Field label="Notes" value={booking.notes} /></div>}
        </div>
      </div>

      {booking.package && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
          <h2 className="text-white font-medium mb-4">Package</h2>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Package Name" value={booking.package.name} />
            <Field label="Price" value={`$${booking.package.price?.toLocaleString()}`} />
            {booking.package.description && <div className="col-span-2"><Field label="Description" value={booking.package.description} /></div>}
            {booking.package.deliverables && <div className="col-span-2"><Field label="Deliverables" value={booking.package.deliverables} /></div>}
          </div>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h2 className="text-white font-medium mb-4">Payment Status</h2>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Total Price" value={booking.total_price != null ? `$${booking.total_price.toLocaleString()}` : null} />
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Deposit</p>
            <p className={`text-sm font-medium ${booking.deposit_paid ? 'text-green-400' : 'text-yellow-400'}`}>
              {booking.deposit_paid ? 'Paid' : 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Deliverables</p>
            <p className={`text-sm font-medium ${booking.deliverables_ready ? 'text-green-400' : 'text-neutral-400'}`}>
              {booking.deliverables_ready ? 'Ready' : 'Not ready yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
