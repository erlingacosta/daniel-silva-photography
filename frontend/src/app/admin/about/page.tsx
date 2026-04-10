'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

interface AboutData {
  title: string
  bio: string
  image_url: string
  experience_years: number
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ title: '', bio: '', image_url: '', experience_years: 0 })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const token = localStorage.getItem('djs_token')
      const response = await axios.get(`${API_URL}/admin/about`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAbout(response.data)
      setFormData(response.data)
    } catch (err) {
      setError('Error loading about section')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('djs_token')
      await axios.put(`${API_URL}/admin/about`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAbout(formData)
      setIsEditing(false)
      setError('')
    } catch (err) {
      setError('Error saving changes')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">About Section</h1>
        <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">
          ← Back to Dashboard
        </Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-900 text-red-100 rounded">{error}</div>}

      {about && (
        <div className="bg-slate-800 rounded-lg p-8 max-w-2xl">
          {!isEditing ? (
            <>
              <h2 className="text-2xl font-bold mb-4">{about.title}</h2>
              <p className="text-slate-300 mb-6">{about.bio}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-white"
                  rows={6}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
