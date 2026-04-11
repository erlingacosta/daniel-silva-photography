'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AboutData {
  id?: number
  photographer_name: string
  bio: string
  photo_url: string
  events_photographed: number
  years_experience: number
  client_satisfaction: number
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData>({
    photographer_name: 'Daniel Silva',
    bio: 'Daniel Silva is a passionate photographer dedicated to capturing life\'s most important moments. With over 15 years of experience, he specializes in wedding, quinceañera, and event photography.',
    photo_url: '',
    events_photographed: 500,
    years_experience: 15,
    client_satisfaction: 100,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const token = localStorage.getItem('djs_token')
      const response = await fetch(`${API_URL}/admin/about`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAbout(data)
      }
    } catch (err) {
      console.error('Error loading about data:', err)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('djs_token')
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      setAbout({ ...about, photo_url: data.url })
      setError('')
    } catch (err) {
      setError('Error uploading image')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('djs_token')
      const response = await fetch(`${API_URL}/admin/about`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(about),
      })

      if (!response.ok) throw new Error('Failed to save')
      setSuccess('About section updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Error saving about section')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">About Section</h1>
        <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded text-green-100">
          {success}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-8 max-w-3xl">
        {/* Photographer Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Photographer Name</label>
          <input
            type="text"
            value={about.photographer_name}
            onChange={(e) => setAbout({ ...about, photographer_name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white"
            placeholder="Daniel Silva"
          />
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Bio</label>
          <textarea
            value={about.bio}
            onChange={(e) => setAbout({ ...about, bio: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white"
            rows={6}
            placeholder="Daniel Silva is a passionate photographer..."
          />
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Photographer Photo</label>
          {about.photo_url && (
            <div className="mb-4">
              <img src={about.photo_url} alt="Photographer" className="w-48 h-48 object-cover rounded" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white"
          />
          {uploading && <p className="text-sm text-blue-400 mt-2">Uploading...</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Events Photographed</label>
            <input
              type="number"
              value={about.events_photographed}
              onChange={(e) => setAbout({ ...about, events_photographed: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Years of Experience</label>
            <input
              type="number"
              value={about.years_experience}
              onChange={(e) => setAbout({ ...about, years_experience: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Client Satisfaction %</label>
            <input
              type="number"
              value={about.client_satisfaction}
              onChange={(e) => setAbout({ ...about, client_satisfaction: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
