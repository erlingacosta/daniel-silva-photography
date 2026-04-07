'use client'

import React, { useState } from 'react'
import axios from 'axios'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries`,
        {
          email,
          full_name: 'Newsletter Subscriber',
          service_type: 'events',
          message: 'Newsletter signup',
        }
      )
      setMessage('Thank you for subscribing!')
      setEmail('')
    } catch (error) {
      setMessage('Error subscribing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gold text-black">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
        <p className="text-lg mb-8">
          Subscribe to our newsletter for photography tips, location guides, and special offers.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded text-black placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-black text-gold font-semibold rounded hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm font-semibold">
            {message}
          </p>
        )}
      </div>
    </section>
  )
}
