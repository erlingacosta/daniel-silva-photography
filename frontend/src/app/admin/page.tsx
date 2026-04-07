'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface DashboardStats {
  total_bookings: number
  confirmed_bookings: number
  pending_inquiries: number
  total_revenue: number
}

const quickLinks = [
  { href: '/admin/portfolio', label: 'Manage Portfolio', desc: 'Add, edit, or remove portfolio items', color: '#d4af37' },
  { href: '/admin/about', label: 'Edit About Section', desc: 'Update bio and profile photo', color: '#c19b2e' },
  { href: '/admin/bookings', label: 'View Bookings', desc: 'Review and manage client bookings', color: '#b08827' },
  { href: '/admin/settings', label: 'Site Settings', desc: 'Configure site content and preferences', color: '#9f7720' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('djs_token')
        const response = await axios.get(`${API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStats(response.data)
      } catch {
        setError('Could not load dashboard stats.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = stats
    ? [
        { label: 'Total Bookings', value: stats.total_bookings, sub: 'all time' },
        { label: 'Confirmed', value: stats.confirmed_bookings, sub: 'bookings' },
        { label: 'Pending Inquiries', value: stats.pending_inquiries, sub: 'awaiting response' },
        { label: 'Total Revenue', value: `$${(stats.total_revenue || 0).toLocaleString()}`, sub: 'from paid invoices' },
      ]
    : []

  return (
    <div style={{ padding: '40px 48px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p style={{ color: '#d4af37', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Welcome Back
        </p>
        <h1 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '13px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      <div style={{ height: '1px', backgroundColor: 'rgba(212,175,55,0.12)', margin: '28px 0' }} />

      {/* Stats */}
      {loading ? (
        <p style={{ color: '#555', fontSize: '13px' }}>Loading stats...</p>
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: 'rgba(180,40,40,0.1)', border: '1px solid rgba(180,40,40,0.2)', borderRadius: '4px', marginBottom: '32px' }}>
          <p style={{ color: '#cc6666', fontSize: '13px' }}>{error}</p>
          <p style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>Stats require admin role and a running backend.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                backgroundColor: '#111',
                border: '1px solid rgba(212,175,55,0.1)',
                borderRadius: '6px',
                padding: '24px',
              }}
            >
              <p style={{ color: '#555', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                {card.label}
              </p>
              <p style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                {card.value}
              </p>
              <p style={{ color: '#444', fontSize: '11px' }}>{card.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <h2 style={{ color: '#f5f5f5', fontSize: '16px', fontWeight: '600', marginBottom: '20px', letterSpacing: '0.02em' }}>
        Quick Actions
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {quickLinks.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
          >
            <Link
              href={link.href}
              style={{
                display: 'block',
                padding: '24px',
                backgroundColor: '#111',
                border: '1px solid rgba(212,175,55,0.1)',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
            >
              <p style={{ color: '#d4af37', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                {link.label} →
              </p>
              <p style={{ color: '#666', fontSize: '13px' }}>{link.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
