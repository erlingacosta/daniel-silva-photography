'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PortfolioItem {
  id: number
  title: string
  description: string
  category: string
  image_url: string
}

export default function PortfolioPage() {
  const router = useRouter()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editData, setEditData] = useState({ title: '', description: '', category: 'Weddings', image_url: '' })
  const [createData, setCreateData] = useState({ title: '', description: '', category: 'Weddings', image_url: '' })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchItems()
  }, [router])

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/portfolios`)
      if (!response.ok) throw new Error('Failed to fetch portfolio')
      const data = await response.json()
      setItems(data)
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

    try {
      const formData = new FormData()
      formData.append('file', e.target.files[0])

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')
      const { url } = await response.json()

      if (forCreate) {
        setCreateData({ ...createData, image_url: url })
      } else {
        setEditData({ ...editData, image_url: url })
      }
    } catch (err) {
      setError('Image upload failed')
      console.error(err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreateItem = async () => {
    if (!createData.title || !createData.image_url) {
      setError('Title and image are required')
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/admin/portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      })
      if (!response.ok) throw new Error('Failed to create item')
      const newItem = await response.json()
      setItems([...items, newItem])
      setCreateData({ title: '', description: '', category: 'Weddings', image_url: '' })
      setIsCreating(false)
      setError('')
    } catch (err) {
      setError('Error creating portfolio item')
      console.error(err)
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this portfolio item?')) return
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/admin/portfolio/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to delete')
      setItems(items.filter(i => i.id !== id))
      if (selectedItem?.id === id) setSelectedItem(null)
    } catch (err) {
      setError('Error deleting item')
      console.error(err)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white p-8"><p className="text-center">Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Portfolio Management</h1>
            <p className="text-slate-400">Manage portfolio items</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">← Back</Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {isCreating ? (
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">New Portfolio Item</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Title" value={createData.title} onChange={(e) => setCreateData({ ...createData, title: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
                  <textarea placeholder="Description" rows={3} value={createData.description} onChange={(e) => setCreateData({ ...createData, description: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
                  <select value={createData.category} onChange={(e) => setCreateData({ ...createData, category: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
                    <option>Weddings</option>
                    <option>Quinceañeras</option>
                    <option>Events</option>
                    <option>Portraits</option>
                  </select>
                  <div className="border-2 border-dashed border-slate-600 rounded p-4">
                    {createData.image_url ? (
                      <div>
                        <img src={createData.image_url} alt="Preview" className="max-w-full max-h-40 mx-auto mb-2" />
                        <label className="text-sm text-blue-400 cursor-pointer">Change image</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                      </div>
                    ) : (
                      <label className="block text-center text-slate-400 cursor-pointer">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                        Click to upload image
                      </label>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCreateItem} disabled={uploadingImage} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50">Create</button>
                    <button onClick={() => setIsCreating(false)} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Cancel</button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Items ({items.length})</h2>
                <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">+ New Item</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {items.map(item => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} className={`p-3 rounded cursor-pointer border ${selectedItem?.id === item.id ? 'border-blue-500 bg-slate-700' : 'border-slate-600 hover:bg-slate-700'}`}>
                    <img src={item.image_url} alt={item.title} className="w-full h-24 object-cover rounded mb-2" />
                    <p className="text-sm font-semibold truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedItem && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Item Details</h2>
              <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full rounded mb-4" />
              <div className="space-y-4">
                <div><p className="text-slate-400 text-sm">Title</p><p className="text-white font-semibold">{selectedItem.title}</p></div>
                <div><p className="text-slate-400 text-sm">Category</p><p className="text-white">{selectedItem.category}</p></div>
                <div><p className="text-slate-400 text-sm">Description</p><p className="text-white text-sm">{selectedItem.description}</p></div>
                <button onClick={() => handleDeleteItem(selectedItem.id)} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
