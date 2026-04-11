'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface Service {
  id: number
  name: string
  description: string
  price: number
  is_active: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editData, setEditData] = useState({ name: '', description: '', price: 0, is_active: true })
  const [createData, setCreateData] = useState({ name: '', description: '', price: 0, is_active: true })

  useEffect(() => { fetchServices() }, [])

  const fetchServices = async () => {
    try {
      const res = await adminApi.get('/admin/services')
      setServices(res.data)
      setError('')
    } catch (err) {
      setError('Error loading services')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async () => {
    if (!createData.name || !createData.price) { setError('Name and price are required'); return }
    try {
      const res = await adminApi.post('/admin/services', createData)
      setServices(prev => [...prev, res.data])
      setCreateData({ name: '', description: '', price: 0, is_active: true })
      setIsCreating(false)
      setError('')
    } catch (err) {
      setError('Error creating service')
      console.error(err)
    }
  }

  const handleUpdateService = async () => {
    if (!selectedService) return
    try {
      const res = await adminApi.put(`/admin/services/${selectedService.id}`, editData)
      setServices(prev => prev.map(s => s.id === res.data.id ? { ...s, ...res.data } : s))
      setSelectedService({ ...selectedService, ...res.data })
      setIsEditing(false)
      setError('')
    } catch (err) {
      setError('Error updating service')
      console.error(err)
    }
  }

  const handleDeleteService = async (id: number) => {
    if (!confirm('Delete this service?')) return
    try {
      await adminApi.delete(`/admin/services/${id}`)
      setServices(prev => prev.filter(s => s.id !== id))
      if (selectedService?.id === id) setSelectedService(null)
      setError('')
    } catch (err) {
      setError('Error deleting service')
      console.error(err)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-8"><p className="text-center">Loading services...</p></div>

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">À La Carte Services</h1>
            <p className="text-slate-400">Manage additional services</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">← Back</Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {isCreating && (
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">New Service</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Service Name" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
                  <textarea placeholder="Description" rows={3} value={createData.description} onChange={e => setCreateData({ ...createData, description: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
                  <input type="number" placeholder="Price" value={createData.price} onChange={e => setCreateData({ ...createData, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
                  <label className="flex items-center gap-2"><input type="checkbox" checked={createData.is_active} onChange={e => setCreateData({ ...createData, is_active: e.target.checked })} /><span className="text-sm">Active</span></label>
                  <div className="flex gap-2">
                    <button onClick={handleCreateService} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Create</button>
                    <button onClick={() => setIsCreating(false)} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Services ({services.length})</h2>
                <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">+ New Service</button>
              </div>
              <div className="divide-y divide-slate-700">
                {services.map(service => (
                  <div key={service.id} onClick={() => setSelectedService(service)} className={`p-4 cursor-pointer hover:bg-slate-700 transition-colors ${selectedService?.id === service.id ? 'bg-slate-700' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div><p className="font-semibold text-white">{service.name}</p><p className="text-slate-400 text-sm mt-1">{service.description}</p></div>
                      <p className="font-semibold text-amber-400">${service.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedService && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Service Details</h2>
              {!isEditing ? (
                <div className="space-y-4">
                  <div><p className="text-slate-400 text-sm">Name</p><p className="text-white font-semibold">{selectedService.name}</p></div>
                  <div><p className="text-slate-400 text-sm">Description</p><p className="text-white text-sm mt-2">{selectedService.description}</p></div>
                  <div><p className="text-slate-400 text-sm">Price</p><p className="text-amber-400 font-bold text-lg">${selectedService.price}</p></div>
                  <div><p className="text-slate-400 text-sm">Status</p><p className="text-white">{selectedService.is_active ? '🟢 Active' : '⚫ Inactive'}</p></div>
                  <div className="flex gap-2 pt-4">
                    <button onClick={() => { setEditData({ name: selectedService.name, description: selectedService.description, price: selectedService.price, is_active: selectedService.is_active }); setIsEditing(true) }} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Edit</button>
                    <button onClick={() => handleDeleteService(selectedService.id)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Delete</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
                  <textarea rows={3} value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
                  <input type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
                  <label className="flex items-center gap-2"><input type="checkbox" checked={editData.is_active} onChange={e => setEditData({ ...editData, is_active: e.target.checked })} /><span className="text-sm">Active</span></label>
                  <div className="flex gap-2">
                    <button onClick={handleUpdateService} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Save</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Cancel</button>
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
