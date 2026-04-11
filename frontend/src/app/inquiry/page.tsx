'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { publicApi } from '@/lib/api'

export default function InquiryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    service_type: 'Wedding',
    event_date: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await publicApi.post('/inquiries', {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.service_type,
        event_date: formData.event_date || null,
        message: formData.message,
      })

      setSuccess(true)
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        service_type: 'Wedding',
        event_date: '',
        message: '',
      })

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError('Failed to submit inquiry. Please try again.')
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
            Let's Create Magic
          </h1>
          <p className="text-slate-400">
            Tell us about your vision and let's discuss how we can bring it to life.
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p style={{ color: '#86efac' }} className="text-center">
              Thank you! We've received your inquiry and will be in touch soon.
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
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Service Type *
              </label>
              <select
                required
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              >
                <option value="Wedding">Wedding</option>
                <option value="Quinceañera">Quinceañera</option>
                <option value="Event">Event</option>
                <option value="Portrait">Portrait</option>
              </select>
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Event Date
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-2" style={{ color: '#d4af37' }}>
                Message *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full button button-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Inquiry'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
