"use client"

import { useEffect, useState } from "react"
import { adminApi } from "@/lib/api"

interface Booking {
  id: number
  client_name: string
  client_email: string
  client_phone: string
  package: string
  event_type: string
  event_date: string | null
  event_location: string
  status: string
  total_price: number
  deposit_paid: boolean
  notes: string
  created_at: string | null
}

const STATUSES = ["pending", "confirmed", "deposit_paid", "completed", "cancelled"]

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  deposit_paid: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({})
  const [savingNotes, setSavingNotes] = useState<Record<number, boolean>>({})

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminApi.get("/admin/bookings")
      setBookings(res.data)
    } catch {
      setError("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await adminApi.patch(`/admin/bookings/${id}`, { status })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: res.data.status } : b))
    } catch {
      alert("Failed to update status")
    }
  }

  const saveNotes = async (id: number) => {
    const notes = editingNotes[id]
    if (notes === undefined) return
    setSavingNotes(prev => ({ ...prev, [id]: true }))
    try {
      await adminApi.patch(`/admin/bookings/${id}`, { notes })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, notes } : b))
      setEditingNotes(prev => { const n = { ...prev }; delete n[id]; return n })
    } catch {
      alert("Failed to save notes")
    } finally {
      setSavingNotes(prev => ({ ...prev, [id]: false }))
    }
  }

  const deleteBooking = async (id: number) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return
    try {
      await adminApi.delete(`/admin/bookings/${id}`)
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch {
      alert("Failed to delete booking")
    }
  }

  const fmt = (s: string | null) => s ? new Date(s).toLocaleDateString() : "—"

  if (loading) return <div className="p-8 text-gray-500">Loading bookings...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {[
                "Client","Email","Package","Event Date","Event Type",
                "Location","Status","Price","Deposit","Created","Notes","Actions"
              ].map(h => (
                <th key={h} className="px-3 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-400">No bookings found</td></tr>
            )}
            {bookings.map(b => {
              const isEditingNotes = editingNotes[b.id] !== undefined
              const notesValue = isEditingNotes ? editingNotes[b.id] : b.notes
              return (
                <tr key={b.id} className="hover:bg-gray-50 align-top">
                  <td className="px-3 py-3 font-medium whitespace-nowrap">{b.client_name || "—"}</td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{b.client_email || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{b.package || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{fmt(b.event_date)}</td>
                  <td className="px-3 py-3 capitalize whitespace-nowrap">{b.event_type || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{b.event_location || "—"}</td>
                  <td className="px-3 py-3">
                    <select
                      value={b.status}
                      onChange={e => updateStatus(b.id, e.target.value)}
                      className={`text-xs rounded-full px-2 py-1 border-0 font-medium cursor-pointer ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">${(b.total_price || 0).toLocaleString()}</td>
                  <td className="px-3 py-3 text-center">
                    {b.deposit_paid ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-500">{fmt(b.created_at)}</td>
                  <td className="px-3 py-3 min-w-[200px]">
                    <textarea
                      rows={2}
                      className="w-full border rounded px-2 py-1 text-xs resize-none"
                      value={notesValue || ""}
                      onChange={e => setEditingNotes(prev => ({ ...prev, [b.id]: e.target.value }))}
                    />
                    {isEditingNotes && (
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => saveNotes(b.id)}
                          disabled={savingNotes[b.id]}
                          className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                          {savingNotes[b.id] ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingNotes(prev => { const n = { ...prev }; delete n[b.id]; return n })}
                          className="px-2 py-0.5 text-xs bg-gray-200 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <button
                      onClick={() => deleteBooking(b.id)}
                      className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
