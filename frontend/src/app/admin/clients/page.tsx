'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface Client {
  id: number
  full_name: string
  email: string
  phone: string
  role: string
  created_at: string
  booking: {
    id: number
    status: string
    event_date: string | null
    event_type: string
    package_name: string
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-800',
  deposit_paid: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.get('/admin/clients')
      .then(r => setClients(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Loading clients...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Clients</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Name','Email','Phone','Role','Joined','Booking','Event Date',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {clients.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No clients yet</td></tr>
            )}
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.full_name || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{c.role}</td>
                <td className="px-4 py-3 text-gray-500">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  {c.booking ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.booking.status] || 'bg-gray-100 text-gray-700'}`}>
                      {c.booking.status.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      No Booking
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {c.booking?.event_date ? new Date(c.booking.event_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  {c.id ? (
                    <Link href={`/admin/clients/${c.id}`}
                      className="px-3 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium">
                      View
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
