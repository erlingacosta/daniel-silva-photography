'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Inquiry {
  id: number
  email: string
  full_name: string
  phone: string
  service_type: string
  event_date: string | null
  message: string
  status: string
  created_at: string | null
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-red-900 text-red-100',
  read: 'bg-gray-700 text-gray-300',
  contacted: 'bg-yellow-900 text-yellow-100',
  converted: 'bg-green-900 text-green-100',
  dismissed: 'bg-slate-700 text-slate-300',
}

const INQUIRY_STATUSES = ['new', 'read', 'contacted', 'converted', 'dismissed']

export default function InquiriesAdmin() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [filtered, setFiltered] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem('djs_token')
      const res = await fetch(`${API_URL}/admin/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setInquiries(data)
      setFiltered(data)
      setError('')
    } catch (err) {
      setError('Error loading inquiries')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setFiltered(status === 'all' ? inquiries : inquiries.filter(i => i.status === status))
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('djs_token')
      const res = await fetch(`${API_URL}/admin/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setInquiries(prev => prev.map(i => i.id === id ? updated : i))
      setFiltered(prev => prev.map(i => i.id === id ? updated : i))
    } catch (err) {
      alert('Failed to update status')
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this inquiry? This cannot be undone.')) return
    try {
      const token = localStorage.getItem('djs_token')
      const res = await fetch(`${API_URL}/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete')
      setInquiries(prev => prev.filter(i => i.id !== id))
      setFiltered(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      alert('Failed to delete inquiry')
      console.error(err)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400"><p>Loading inquiries...</p></div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Inquiries</h1>
        <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">{error}</div>
      )}

      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', ...INQUIRY_STATUSES].map(s => (
          <button
            key={s}
            onClick={() => handleStatusFilter(s)}
            className={`px-4 py-2 rounded transition-colors capitalize ${
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700">
              <tr>
                {['Name', 'Email', 'Phone', 'Service Type', 'Event Date', 'Message', 'Status', 'Date Submitted', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map(inq => (
                <tr key={inq.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">{inq.full_name || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{inq.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{inq.phone || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap capitalize">{inq.service_type || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {inq.event_date ? new Date(inq.event_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span title={inq.message}>
                      {inq.message ? inq.message.slice(0, 60) + (inq.message.length > 60 ? '…' : '') : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[inq.status] || 'bg-gray-700 text-gray-300'}`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                    {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2 items-center">
                      <select
                        value={inq.status}
                        onChange={e => handleStatusChange(inq.id, e.target.value)}
                        className="bg-slate-600 text-white text-xs rounded px-2 py-1 border border-slate-500"
                      >
                        {INQUIRY_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(inq.id)}
                        className="px-2 py-1 bg-red-800 hover:bg-red-700 text-white text-xs rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 p-8 text-center text-gray-400"><p>No inquiries found</p></div>
      )}
    </div>
  )
}
