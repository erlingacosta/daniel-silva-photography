'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface Package {
  id: number
  name: string
  description: string
  price: number
  deliverables: string
  is_active: boolean
  created_at: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editData, setEditData] = useState({ name: '', description: '', price: 0, deliverables: '', is_active: true })

  useEffect(() => { fetchPackages() }, [])

  const fetchPackages = async () => {
    try {
      const res = await adminApi.get('/admin/packages')
      setPackages(res.data)
      setError('')
    } catch (err) {
      setError('Error loading packages')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg)
    setEditData({ name: pkg.name, description: pkg.description, price: pkg.price, deliverables: pkg.deliverables, is_active: pkg.is_active })
    setIsEditing(false)
    setIsCreating(false)
  }

  const handleSavePackage = async () => {
    try {
      if (isCreating) {
        const res = await adminApi.post('/admin/packages', editData)
        setPackages(prev => [...prev, res.data])
        setSelectedPackage(res.data)
      } else if (selectedPackage) {
        const res = await adminApi.put(`/admin/packages/${selectedPackage.id}`, editData)
        setPackages(prev => prev.map(p => p.id === res.data.id ? res.data : p))
        setSelectedPackage(res.data)
      }
      setIsEditing(false)
      setIsCreating(false)
    } catch (err) {
      setError('Error saving package')
      console.error(err)
    }
  }

  const handleDeletePackage = async (packageId: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      await adminApi.delete(`/admin/packages/${packageId}`)
      setPackages(prev => prev.filter(p => p.id !== packageId))
      setSelectedPackage(null)
      setIsCreating(false)
      setIsEditing(false)
    } catch (err) {
      setError('Error deleting package')
      console.error(err)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-8"><p className="text-center">Loading packages...</p></div>

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Package Management</h1>
            <p className="text-slate-400">Add, edit, or remove service packages</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">← Back to Dashboard</Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Packages ({packages.length})</h2>
                <button onClick={() => { setSelectedPackage(null); setEditData({ name: '', description: '', price: 0, deliverables: '', is_active: true }); setIsCreating(true); setIsEditing(true) }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-sm">
                  + New Package
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {packages.map(pkg => (
                      <tr key={pkg.id} onClick={() => handleSelectPackage(pkg)}
                        className={`cursor-pointer hover:bg-slate-700 transition-colors ${selectedPackage?.id === pkg.id ? 'bg-slate-700' : ''}`}>
                        <td className="px-6 py-3 text-sm font-semibold">{pkg.name}</td>
                        <td className="px-6 py-3 text-sm">${pkg.price.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${pkg.is_active ? 'bg-green-900 text-green-100' : 'bg-gray-900 text-gray-100'}`}>
                            {pkg.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {(selectedPackage || isCreating) && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">{isCreating ? 'New Package' : 'Package Details'}</h2>
              {!isEditing && !isCreating ? (
                <div className="space-y-4">
                  <div><p className="text-slate-400 text-sm">Name</p><p className="text-white font-semibold">{selectedPackage?.name}</p></div>
                  <div><p className="text-slate-400 text-sm">Price</p><p className="text-white font-semibold text-lg">${selectedPackage?.price.toLocaleString()}</p></div>
                  <div><p className="text-slate-400 text-sm">Description</p><p className="text-white text-sm">{selectedPackage?.description}</p></div>
                  <div><p className="text-slate-400 text-sm">Deliverables</p><p className="text-white text-sm whitespace-pre-wrap">{selectedPackage?.deliverables}</p></div>
                  <div className="pt-4 space-y-2">
                    <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">Edit Package</button>
                    <button onClick={() => handleDeletePackage(selectedPackage!.id)} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">Delete</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div><label className="block text-sm text-slate-400 mb-2">Package Name *</label>
                    <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" /></div>
                  <div><label className="block text-sm text-slate-400 mb-2">Price *</label>
                    <input type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" /></div>
                  <div><label className="block text-sm text-slate-400 mb-2">Description *</label>
                    <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" rows={3} /></div>
                  <div><label className="block text-sm text-slate-400 mb-2">Deliverables *</label>
                    <textarea value={editData.deliverables} onChange={e => setEditData({ ...editData, deliverables: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" rows={4} /></div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editData.is_active} onChange={e => setEditData({ ...editData, is_active: e.target.checked })} className="rounded" />
                    <span className="text-slate-300">Active</span>
                  </label>
                  <div className="pt-4 space-y-2">
                    <button onClick={handleSavePackage} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">Save Package</button>
                    <button onClick={() => { setIsEditing(false); setIsCreating(false); setSelectedPackage(null) }} className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
