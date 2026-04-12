'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface Testimonial {
  id: number
  client_name: string
  event_type: string
  quote: string
  rating: number
  image_url: string
  order: number
  is_approved: boolean
}

const blank = { client_name: '', event_type: '', quote: '', rating: 5, image_url: '', order: 0, is_approved: true }

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ ...blank })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    try {
      const res = await adminApi.get('/admin/testimonials')
      setItems(res.data)
      setError('')
    } catch (e) {
      setError('Error loading testimonials')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editId !== null) {
        const res = await adminApi.put(`/admin/testimonials/${editId}`, form)
        setItems(prev => prev.map(i => i.id === editId ? { ...i, ...res.data } : i))
      } else {
        const res = await adminApi.post('/admin/testimonials', form)
        setItems(prev => [...prev, res.data])
      }
      setForm({ ...blank })
      setEditId(null)
    } catch (e) {
      setError('Error saving testimonial')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this testimonial?')) return
    try {
      await adminApi.delete(`/admin/testimonials/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e) { console.error(e) }
  }

  async function handleToggleApprove(item: Testimonial) {
    try {
      const res = await adminApi.patch(`/admin/testimonials/${item.id}/approve`)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_approved: res.data.is_approved } : i))
    } catch (e) { console.error(e) }
  }

  function startEdit(item: Testimonial) {
    setEditId(item.id)
    setForm({ client_name: item.client_name, event_type: item.event_type, quote: item.quote, rating: item.rating, image_url: item.image_url, order: item.order, is_approved: item.is_approved })
  }

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-8"><p className="text-center">Loading...</p></div>

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Testimonials</h1>
            <p className="text-slate-400">Manage client testimonials</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">← Back to Dashboard</Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">{error}</div>}

        {/* Form */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editId !== null ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Client Name</label>
              <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Event Type</label>
              <input value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="e.g. Wedding" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Quote</label>
              <textarea rows={3} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white resize-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Rating (1-5)</label>
              <input type="number" min={1} max={5} step={0.5} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) || 5 }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Image URL</label>
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="is_approved" checked={form.is_approved} onChange={e => setForm(f => ({ ...f, is_approved: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="is_approved" className="text-sm text-slate-300">Approved</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editId !== null ? 'Update' : 'Add Testimonial'}
            </button>
            {editId !== null && (
              <button onClick={() => { setEditId(null); setForm({ ...blank }) }} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">Cancel</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold">Testimonials ({items.length})</h2>
          </div>
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Event</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Approved</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium">{item.client_name}</td>
                  <td className="px-6 py-3 text-sm text-slate-400">{item.event_type}</td>
                  <td className="px-6 py-3 text-sm">{'★'.repeat(Math.round(item.rating || 0))}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.is_approved ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'}`}>
                      {item.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleApprove(item)} className={`px-3 py-1 rounded text-xs ${item.is_approved ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-green-700 hover:bg-green-600'}`}>
                        {item.is_approved ? 'Reject' : 'Approve'}
                      </button>
                      <button onClick={() => startEdit(item)} className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No testimonials yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
