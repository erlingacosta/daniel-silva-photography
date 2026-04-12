'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface FeaturedInItem {
  id: number
  name: string
  logo_url: string
  url: string
  is_active: boolean
  order: number
}

const blank = { name: '', logo_url: '', url: '', is_active: true, order: 0 }

export default function FeaturedInPage() {
  const [items, setItems] = useState<FeaturedInItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ ...blank })
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    try {
      const res = await adminApi.get('/admin/featured-in')
      setItems(res.data)
      setError('')
    } catch (e) {
      setError('Error loading items')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editId !== null) {
        const res = await adminApi.put(`/admin/featured-in/${editId}`, form)
        setItems(prev => prev.map(i => i.id === editId ? { ...i, ...res.data } : i))
      } else {
        const res = await adminApi.post('/admin/featured-in', form)
        setItems(prev => [...prev, res.data])
      }
      setForm({ ...blank })
      setEditId(null)
    } catch (e) {
      setError('Error saving item')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this item?')) return
    try {
      await adminApi.delete(`/admin/featured-in/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e) { console.error(e) }
  }

  function startEdit(item: FeaturedInItem) {
    setEditId(item.id)
    setForm({ name: item.name, logo_url: item.logo_url, url: item.url, is_active: item.is_active, order: item.order })
  }

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-8"><p className="text-center">Loading...</p></div>

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Featured In</h1>
            <p className="text-slate-400">Manage press and media features</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">← Back to Dashboard</Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">{error}</div>}

        {/* Form */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editId !== null ? 'Edit Item' : 'Add New Item'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="e.g. Vogue" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Logo URL</label>
              <input value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Website URL</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editId !== null ? 'Update' : 'Add Item'}
            </button>
            {editId !== null && (
              <button onClick={() => { setEditId(null); setForm({ ...blank }) }} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">Cancel</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold">Items ({items.length})</h2>
          </div>
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">URL</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Order</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-400 max-w-xs truncate">{item.url}</td>
                  <td className="px-6 py-3 text-sm">{item.order}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.is_active ? 'bg-green-900 text-green-100' : 'bg-slate-600 text-slate-300'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(item)} className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No items yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
