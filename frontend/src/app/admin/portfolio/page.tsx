'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, publicApi } from '@/lib/api'

interface PortfolioItem {
  id: number
  title: string
  description: string
  category: string
  image_url: string
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editData, setEditData] = useState({ title: '', description: '', category: 'Weddings', image_url: '' })
  const [createData, setCreateData] = useState({ title: '', description: '', category: 'Weddings', image_url: '' })

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const res = await publicApi.get('/portfolios')
      setItems(res.data)
      setError('')
    } catch (err) {
      setError('Error loading portfolio')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, forCreate: boolean) => {
    if (!e.target.files?.[0]) return
    setUploadingImage(true)
    setError('')
    try {
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append('file', file)
      const res = await adminApi.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (forCreate) setCreateData(prev => ({ ...prev, image_url: res.data.url }))
      else setEditData(prev => ({ ...prev, image_url: res.data.url }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(`Image upload failed: ${msg}`)
      console.error(err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreateItem = async () => {
    if (!createData.title || !createData.image_url) { setError('Title and image are required'); return }
    try {
      const res = await adminApi.post('/admin/portfolio', createData)
      setItems(prev => [...prev, res.data])
      setCreateData({ title: '', description: '', category: 'Weddings', image_url: '' })
      setIsCreating(false)
      setError('')
    } catch (err) {
      setError('Error creating portfolio item')
      console.error(err)
    }
  }

  const handleUpdateItem = async () => {
    if (!selectedItem) return
    try {
      const res = await adminApi.put(`/admin/portfolio/${selectedItem.id}`, editData)
      setItems(prev => prev.map(i => i.id === res.data.id ? res.data : i))
      setIsEditing(false)
      setSelectedItem(null)
      setError('')
    } catch (err) {
      setError('Error updating portfolio item')
      console.error(err)
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this item?')) return
    try {
      await adminApi.delete(`/admin/portfolio/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
      setError('')
    } catch (err) {
      setError('Error deleting portfolio item')
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Portfolio</h1>
        <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">← Back to Dashboard</Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">{error}</div>}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Items</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} onClick={() => { setSelectedItem(item); setEditData({ title: item.title, description: item.description, category: item.category, image_url: item.image_url }); setIsEditing(true) }}
                className="p-4 bg-slate-700 rounded cursor-pointer hover:bg-slate-600 transition-colors">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-300">{item.category}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setIsCreating(true); setCreateData({ title: '', description: '', category: 'Weddings', image_url: '' }) }}
            className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
            + Add Item
          </button>
        </div>

        <div>
          {isEditing && selectedItem ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Edit Item</h2>
              <div className="space-y-4">
                <input type="text" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Title" className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white" />
                <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="Description" className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white" rows={4} />
                <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white">
                  <option>Weddings</option><option>Quinceañera</option><option>Events</option><option>Portraits</option>
                </select>
                {editData.image_url && <img src={editData.image_url} alt="Preview" className="w-full h-48 object-cover rounded" />}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)} disabled={uploadingImage} className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white" />
                {uploadingImage && <p className="text-blue-400">Uploading...</p>}
                <div className="flex gap-2">
                  <button onClick={handleUpdateItem} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">Save</button>
                  <button onClick={() => handleDeleteItem(selectedItem.id)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">Delete</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded transition-colors">Cancel</button>
                </div>
              </div>
            </>
          ) : isCreating ? (
            <>
              <h2 className="text-2xl font-bold mb-4">New Item</h2>
              <div className="space-y-4">
                <input type="text" value={createData.title} onChange={e => setCreateData({ ...createData, title: e.target.value })} placeholder="Title" className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white" />
                <textarea value={createData.description} onChange={e => setCreateData({ ...createData, description: e.target.value })} placeholder="Description" className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white" rows={4} />
                <select value={createData.category} onChange={e => setCreateData({ ...createData, category: e.target.value })} className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white">
                  <option>Weddings</option><option>Quinceañera</option><option>Events</option><option>Portraits</option>
                </select>
                {createData.image_url && <img src={createData.image_url} alt="Preview" className="w-full h-48 object-cover rounded" />}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true)} disabled={uploadingImage} className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white" />
                {uploadingImage && <p className="text-blue-400">Uploading...</p>}
                <div className="flex gap-2">
                  <button onClick={handleCreateItem} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">Create</button>
                  <button onClick={() => setIsCreating(false)} className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded transition-colors">Cancel</button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400">Select an item to edit or create a new one</p>
          )}
        </div>
      </div>
    </div>
  )
}
