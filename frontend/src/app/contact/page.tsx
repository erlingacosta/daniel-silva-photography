'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit contact form')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError('Failed to send message. Please try again.')
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
            Get in Touch
          </h1>
          <p className="text-slate-400">
            Have a question or ready to book? We'd love to hear from you.
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p style={{ color: '#86efac' }} className="text-center">
              Thank you! We've received your message and will get back to you soon.
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                Message *
              </label>
              <textarea
                required
                rows={6}
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
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
