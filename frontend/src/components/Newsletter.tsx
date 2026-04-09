'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [registerData, setRegisterData] = useState({ full_name: '', password: '', password_confirm: '' })
  const [registering, setRegistering] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Subscribe to newsletter
      await axios.post(`${API_URL}/newsletter/subscribe`, {
        email,
      })
      setMessage('Thank you for subscribing!')
      setSuccess(true)
      setEmail('')
      setShowRegister(true)
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error subscribing. Please try again.'
      setMessage(errorMsg)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerData.password !== registerData.password_confirm) {
      setMessage('Passwords do not match.')
      setSuccess(false)
      return
    }

    setRegistering(true)
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        full_name: registerData.full_name,
        password: registerData.password,
      })
      setMessage('Account created! You can now log in.')
      setSuccess(true)
      setShowRegister(false)
      setRegisterData({ full_name: '', password: '', password_confirm: '' })
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error creating account. Please try again.'
      setMessage(errorMsg)
      setSuccess(false)
    } finally {
      setRegistering(false)
    }
  }

  return (
    <section className="py-20 relative" style={{ backgroundColor: '#0f0f0f' }}>
      {/* Top gold line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto px-6 text-center"
      >
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#d4af37', letterSpacing: '0.4em' }}>
          Stay Connected
        </p>
        <h2
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif", color: '#f5f5f5' }}
        >
          Stay Updated
        </h2>
        <p className="text-sm mb-10 font-light" style={{ color: '#b0b0b0' }}>
          Subscribe for photography tips, location guides, and exclusive offers.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-5 py-3 rounded text-sm"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(212,175,55,0.25)',
              color: '#f5f5f5',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded text-sm font-semibold transition-all duration-300 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #c9a961)',
              color: '#0f0f0f',
              border: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm"
            style={{ color: success ? '#d4af37' : '#ff6b6b' }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </section>
  )
}
