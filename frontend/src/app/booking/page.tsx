'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Package {
  id: number
  name: string
  price: number
  description: string
  deliverables: string
}

export default function BookingPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [formData, setFormData] = useState({
    client_email: '',
    package_id: '',
    event_date: '',
    event_type: 'wedding',
    event_location: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/packages`)
        if (response.ok) {
          const data = await response.json()
          setPackages(data)
        }
      } catch (err) {
        console.error('Failed to fetch packages:', err)
      }
    }
    fetchPackages()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_email: formData.client_email,
          package_id: parseInt(formData.package_id),
          event_date: formData.event_date,
          event_type: formData.event_type,
          event_location: formData.event_location,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to create booking')
      }

      setSuccess(true)
      setFormData({
        client_email: '',
        package_id: '',
        event_date: '',
        event_type: 'wedding',
        event_location: '',
        notes: '',
      })

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="max-w-2xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="text-sm uppercase tracking-widest mb-8 inline-block"
          style={{ color: '#d4af37' }}
        >
          ← Back to Home
        </Link>

        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: '#f5f5f5' }}
          >
            Book Your Session
          </h1>
          <p className="text-slate-400">
            Reserve your date and let's create beautiful memories together.
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p style={{ color: '#86efac' }} className="text-center">
              Thank you! Your booking has been created. We'll send you a confirmation email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p style={{ color: '#fca5a5' }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Select Package *
              </label>
              <select
                required
                value={formData.package_id}
                onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              >
                <option value="">Choose a package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - ${pkg.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Event Type *
              </label>
              <select
                required
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              >
                <option value="wedding">Wedding</option>
                <option value="quinceañera">Quinceañera</option>
                <option value="events">Events</option>
                <option value="portraits">Portraits</option>
              </select>
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Event Location *
              </label>
              <input
                type="text"
                required
                placeholder="City, venue, or location"
                value={formData.event_location}
                onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Additional Notes
              </label>
              <textarea
                rows={4}
                placeholder="Any special requests or details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full button button-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Creating Booking...' : 'Complete Booking'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
