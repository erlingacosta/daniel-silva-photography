'use client'

import { useEffect, useState } from 'react'
import { adminApi, publicApi } from '@/lib/api'

interface Inquiry {
  id: number
  name: string
  email: string
  phone: string
  event_type: string
  event_date: string
  message: string
  status: string
  created_at: string
  converted_to_booking_id: number | null
}

interface Package {
  id: number
  name: string
  price: number
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-700',
  contacted: 'bg-amber-100 text-amber-800',
  converted: 'bg-green-100 text-green-800',
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [modal, setModal] = useState({
    package_id: '',
    event_location: '',
    total_price: '',
    deposit_amount: '',
    deposit_due_date: '',
    contract_notes: '',
    internal_notes: '',
    // pre-filled
    client_name: '',
    client_email: '',
    client_phone: '',
    event_date: '',
    event_type: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    try {
      const [inqRes, pkgRes] = await Promise.all([
        adminApi.get('/admin/inquiries'),
        publicApi.get('/packages'),
      ])
      setInquiries(inqRes.data)
      setPackages(pkgRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await adminApi.patch(`/admin/inquiries/${id}/status`, { status })
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    } catch (e) {
      console.error(e)
    }
  }

  async function deleteInquiry(id: number) {
    if (!window.confirm('Delete this inquiry?')) return
    try {
      await adminApi.delete(`/admin/inquiries/${id}`)
      setInquiries(prev => prev.filter(i => i.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  function openModal(inq: Inquiry) {
    setSelectedInquiry(inq)
    setModal({
      package_id: '',
      event_location: '',
      total_price: '',
      deposit_amount: '',
      deposit_due_date: '',
      contract_notes: '',
      internal_notes: '',
      client_name: inq.name || '',
      client_email: inq.email || '',
      client_phone: inq.phone || '',
      event_date: inq.event_date || '',
      event_type: inq.event_type || '',
    })
  }

  async function submitConvert() {
    if (!selectedInquiry) return
    setSubmitting(true)
    try {
      await adminApi.post(`/admin/inquiries/${selectedInquiry.id}/convert`, {
        client_name: modal.client_name,
        client_email: modal.client_email,
        client_phone: modal.client_phone,
        package_id: modal.package_id ? parseInt(modal.package_id) : null,
        event_date: modal.event_date,
        event_type: modal.event_type,
        event_location: modal.event_location,
        total_price: modal.total_price ? parseFloat(modal.total_price) : 0,
        deposit_amount: modal.deposit_amount ? parseFloat(modal.deposit_amount) : 0,
        deposit_due_date: modal.deposit_due_date,
        contract_notes: modal.contract_notes,
        internal_notes: modal.internal_notes,
      })
      setInquiries(prev => prev.map(i =>
        i.id === selectedInquiry.id ? { ...i, status: 'converted' } : i
      ))
      setSelectedInquiry(null)
      setToast('Booking created successfully!')
      setTimeout(() => setToast(''), 3000)
    } catch (e) {
      console.error(e)
      setToast('Error creating booking')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    return dateStr.split('T')[0]
  }

  if (loading) return <div className="p-8 text-gray-500">Loading inquiries...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inquiries</h1>

      {toast && (
        <div className="mb-4 px-4 py-3 rounded bg-green-100 text-green-800 border border-green-300">
          {toast}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Name','Email','Phone','Service','Event Date','Message','Status','Submitted','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {inquiries.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No inquiries yet</td></tr>
            )}
            {inquiries.map(inq => (
              <tr key={inq.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{inq.name || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{inq.email}</td>
                <td className="px-4 py-3 text-gray-600">{inq.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{inq.event_type || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(inq.event_date)}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  <span title={inq.message}>{inq.message ? inq.message.slice(0, 60) + (inq.message.length > 60 ? '…' : '') : '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inq.status] || 'bg-gray-100 text-gray-700'}`}>
                    {inq.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {formatDate(inq.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {inq.status === 'new' && (
                      <button onClick={() => updateStatus(inq.id, 'read')}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
                        Mark Read
                      </button>
                    )}
                    {inq.status !== 'contacted' && inq.status !== 'converted' && (
                      <button onClick={() => updateStatus(inq.id, 'contacted')}
                        className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 rounded text-amber-800">
                        Contacted
                      </button>
                    )}
                    {inq.status !== 'converted' && (
                      <button onClick={() => openModal(inq)}
                        className="px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 rounded text-white">
                        Convert
                      </button>
                    )}
                    <button onClick={() => deleteInquiry(inq.id)}
                      className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded text-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Convert to Booking Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Convert to Booking</h2>
              <button onClick={() => setSelectedInquiry(null)} className="text-gray-500 hover:text-gray-800 text-2xl font-light">×</button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {([
                ['Client Name', 'client_name', 'text'],
                ['Client Email', 'client_email', 'text'],
                ['Client Phone', 'client_phone', 'text'],
              ] as const).map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={(modal as any)[key]} onChange={e => setModal(m => ({...m, [key]: e.target.value}))}
                    className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                <select value={modal.package_id} onChange={e => setModal(m => ({...m, package_id: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select package...</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ${p.price?.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input type="date" value={modal.event_date} onChange={e => setModal(m => ({...m, event_date: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select value={modal.event_type} onChange={e => setModal(m => ({...m, event_type: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select type...</option>
                  {['Wedding','Quinceañera','Corporate Event','Portrait Session','Family Session','Other'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Location</label>
                <input value={modal.event_location} onChange={e => setModal(m => ({...m, event_location: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Price ($)</label>
                <input type="number" value={modal.total_price} onChange={e => setModal(m => ({...m, total_price: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount ($)</label>
                <input type="number" value={modal.deposit_amount} onChange={e => setModal(m => ({...m, deposit_amount: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Due Date</label>
                <input type="date" value={modal.deposit_due_date} onChange={e => setModal(m => ({...m, deposit_due_date: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Notes</label>
                <textarea rows={2} value={modal.contract_notes} onChange={e => setModal(m => ({...m, contract_notes: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                <textarea rows={2} value={modal.internal_notes} onChange={e => setModal(m => ({...m, internal_notes: e.target.value}))}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={submitConvert} disabled={submitting}
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
