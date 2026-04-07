'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '▪' },
  { href: '/admin/portfolio', label: 'Portfolio', icon: '◈' },
  { href: '/admin/about', label: 'About', icon: '◉' },
  { href: '/admin/bookings', label: 'Bookings', icon: '◷' },
  { href: '/admin/settings', label: 'Settings', icon: '◎' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email?: string; username?: string; role?: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('djs_token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const userData = JSON.parse(localStorage.getItem('djs_user') || '{}')
      setUser(userData)
    } catch {}
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('djs_token')
    localStorage.removeItem('djs_user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: '#d4af37', fontSize: '12px', letterSpacing: '0.3em' }}>LOADING...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        backgroundColor: '#0d0d0d',
        borderRight: '1px solid rgba(212,175,55,0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Brand */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
          <p style={{ color: '#d4af37', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Admin Panel
          </p>
          <h1 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 'bold', lineHeight: 1.2 }}>
            Daniel Silva
          </h1>
          <p style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>Photography</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 20px',
                  color: isActive ? '#d4af37' : '#777',
                  backgroundColor: isActive ? 'rgba(212,175,55,0.06)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? '#d4af37' : 'transparent'}`,
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? '500' : '400',
                  letterSpacing: '0.02em',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '10px' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(212,175,55,0.08)' }}>
          {user && (
            <p style={{ color: '#555', fontSize: '11px', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email || user.username}
            </p>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(212,175,55,0.25)',
              color: '#d4af37',
              borderRadius: '3px',
              fontSize: '12px',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Logout
          </button>
          <Link href="/" style={{ display: 'block', textAlign: 'center', marginTop: '8px', color: '#555', fontSize: '11px', textDecoration: 'none' }}>
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#0a0a0a' }}>
        {children}
      </main>
    </div>
  )
}
