'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, publicApi } from '@/lib/api'

interface Booking {
  id: number
  client_id: number
  client_name: string
  client_email: string
  package_id: number
  package_name: string
  package_price: number
  event_date: string | null
  event_type: string
  event_location: string
  status: string
  total_price: number
  deposit_paid: boolean
  deposit_amount: number
  deposit_due_date: string
  contract_notes: string
  internal_notes: string
  notes: string
  created_at: string
}

interface Package {
  id: number
  name: string
  price: number
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-800',
  deposit_paid: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUSES = ['pending', 'confirmed', 'deposit_paid', 'in_progress', 'completed', 'cancelled']

const emptyForm = {
  client_email: '', package_id: '', event_date: '', event_type: '',
  event_location: '', total_price: '', deposit_amount: '', deposit_due_date: '',
  contract_notes: '', internal_notes: '',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [editForm, setEditForm] = useState({ ...emptyForm })
  const [expandedNotes, setExpandedNotes] = useState<number | null>(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const [bRes, pRes] = await Promise.all([
        adminApi.get('/admin/bookings'),
        publicApi.get('/packages'),
      ])
      setBookings(bRes.data)
      setPackages(pRes.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function updateStatus(id: number, status: string) {
    try {
      const res = await adminApi.patch(`/admin/bookings/${id}/status`, { status })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...res.data } : b))
    } catch (e) { console.error(e) }
  }

  async function markDepositPaid(id: number) {
    try {
      const res = await adminApi.patch(`/admin/bookings/${id}/deposit`, { deposit_paid: true })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...res.data } : b))
      showToast('Deposit marked as paid')
    } catch (e) { console.error(e) }
  }

  async function saveNotes(id: number) {
    try {
      const res = await adminApi.put(`/admin/bookings/${id}`, { internal_notes: notesDraft })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...res.data } : b))
      setExpandedNotes(null)
      showToast('Notes saved')
    } catch (e) { console.error(e) }
  }

  async function deleteBooking(id: number) {
    if (!window.confirm('Delete this booking?')) return
    try {
      await adminApi.delete(`/admin/bookings/${id}`)
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch (e) { console.error(e) }
  }

  async function createBooking() {
    setSubmitting(true)
    try {
      const res = await adminApi.post('/admin/bookings', {
        client_email: form.client_email,
        package_id: form.package_id ? parseInt(form.package_id) : null,
        event_date: form.event_date || null,
        event_type: form.event_type,
        event_location: form.event_location,
        total_price: form.total_price ? parseFloat(form.total_price) : 0,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : 0,
        deposit_due_date: form.deposit_due_date,
        contract_notes: form.contract_notes,
        internal_notes: form.internal_notes,
      })
      setBookings(prev => [res.data, ...prev])
      setCreateOpen(false)
      setForm({ ...emptyForm })
      showToast('Booking created')
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  async function saveEdit() {
    if (!editBooking) return
    setSubmitting(true)
    try {
      const res = await adminApi.put(`/admin/bookings/${editBooking.id}`, {
        package_id: editForm.package_id ? parseInt(editForm.package_id) : undefined,
        event_date: editForm.event_date || undefined,
        event_type: editForm.event_type || undefined,
        event_location: editForm.event_location || undefined,
        total_price: editForm.total_price ? parseFloat(editForm.total_price) : undefined,
        deposit_amount: editForm.deposit_amount ? parseFloat(editForm.deposit_amount) : undefined,
        deposit_due_date: editForm.deposit_due_date || undefined,
        contract_notes: editForm.contract_notes,
        internal_notes: editForm.internal_notes,
      })
      setBookings(prev => prev.map(b => b.id === editBooking.id ? { ...b, ...res.data } : b))
      setEditBooking(null)
      showToast('Booking updated')
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  function openEdit(b: Booking) {
    setEditBooking(b)
    setEditForm({
      client_email: b.client_email || '',
      package_id: b.package_id?.toString() || '',
      event_date: b.event_date ? b.event_date.split('T')[0] : '',
      event_type: b.event_type || '',
      event_location: b.event_location || '',
      total_price: b.total_price?.toString() || '',
      deposit_amount: b.deposit_amount?.toString() || '',
      deposit_due_date: b.deposit_due_date || '',
      contract_notes: b.contract_notes || '',
      internal_notes: b.internal_notes || '',
    })
  }

  if (loading) return <div className="p-8 text-gray-500">Loading bookings...</div>

  const FormFields = ({ values, onChange }: { values: typeof emptyForm, onChange: (f: typeof emptyForm) => void }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Client Email *</label>
        <input value={values.client_email} onChange={e => onChange({...values, client_email: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="client@example.com" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Package</label>
        <select value={values.package_id} onChange={e => onChange({...values, package_id: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Select...</option>
          {packages.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price?.toLocaleString()}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Event Date</label>
        <input type="date" value={values.event_date} onChange={e => onChange({...values, event_date: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Event Type</label>
        <input value={values.event_type} onChange={e => onChange({...values, event_type: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Wedding" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Event Location</label>
        <input value={values.event_location} onChange={e => onChange({...values, event_location: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Total Price ($)</label>
        <input type="number" value={values.total_price} onChange={e => onChange({...values, total_price: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Deposit Amount ($)</label>
        <input type="number" value={values.deposit_amount} onChange={e => onChange({...values, deposit_amount: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Deposit Due Date</label>
        <input type="date" value={values.deposit_due_date} onChange={e => onChange({...values, deposit_due_date: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Contract Notes</label>
        <textarea rows={2} value={values.contract_notes} onChange={e => onChange({...values, contract_notes: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Internal Notes</label>
        <textarea rows={2} value={values.internal_notes} onChange={e => onChange({...values, internal_notes: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <button onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium">
          + Create Booking
        </button>
      </div>

      {toast && (
        <div className="mb-4 px-4 py-3 rounded bg-green-100 text-green-800 border border-green-300">{toast}</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Client','Package','Event Date','Type','Location','Status','Price','Deposit','Actions'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {bookings.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No bookings yet</td></tr>
            )}
            {bookings.map(b => (
              <>
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-900">{b.client_name || '—'}</div>
                    <div className="text-xs text-gray-500">{b.client_email}</div>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{b.package_name || '—'}</td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                    {b.event_date ? new Date(b.event_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-3 py-3 text-gray-600">{b.event_type || '—'}</td>
                  <td className="px-3 py-3 text-gray-600">{b.event_location || '—'}</td>
                  <td className="px-3 py-3">
                    <select value={b.status}
                      onChange={e => updateStatus(b.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[b.status] || 'bg-gray-100'}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-gray-700 font-medium">${b.total_price?.toLocaleString() || 0}</td>
                  <td className="px-3 py-3">
                    {b.deposit_paid
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
                      : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Unpaid</span>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => openEdit(b)}
                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded">Edit</button>
                      {!b.deposit_paid && (
                        <button onClick={() => markDepositPaid(b.id)}
                          className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded">
                          Mark Paid
                        </button>
                      )}
                      <button onClick={() => {
                        setExpandedNotes(expandedNotes === b.id ? null : b.id)
                        setNotesDraft(b.internal_notes || '')
                      }}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded">Notes</button>
                      <Link href={`/admin/clients/${b.client_id}`}
                        className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded">
                        Client
                      </Link>
                      <button onClick={() => deleteBooking(b.id)}
                        className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded">Delete</button>
                    </div>
                  </td>
                </tr>
                {expandedNotes === b.id && (
                  <tr key={`notes-${b.id}`} className="bg-gray-50">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="flex gap-2 items-end">
                        <textarea rows={3} value={notesDraft} onChange={e => setNotesDraft(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Internal notes..." />
                        <div className="flex flex-col gap-1">
                          <button onClick={() => saveNotes(b.id)}
                            className="px-3 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded">Save</button>
                          <button onClick={() => setExpandedNotes(null)}
                            className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded">Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Booking Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Create Booking</h2>
              <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-6 py-4">
              <FormFields values={form} onChange={setForm} />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setCreateOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={createBooking} disabled={submitting}
                className="px-5 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Edit Booking</h2>
              <button onClick={() => setEditBooking(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-6 py-4">
              <FormFields values={editForm} onChange={setEditForm} />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setEditBooking(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={saveEdit} disabled={submitting}
                className="px-5 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
