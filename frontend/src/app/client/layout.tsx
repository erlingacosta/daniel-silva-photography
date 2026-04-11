'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('client_token')
    if (!token) {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('client_token')
    localStorage.removeItem('client_user')
    router.push('/')
  }

  if (!ready) return null

  const navLinks = [
    { href: '/client', label: 'Dashboard' },
    { href: '/client/booking', label: 'My Booking' },
    { href: '/client/messages', label: 'Messages' },
    { href: '/client/gallery', label: 'Gallery' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <p className="text-white text-sm font-light tracking-widest uppercase">Client Portal</p>
          <p className="text-neutral-500 text-xs mt-1">Daniel Silva Photography</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2.5 rounded text-sm transition ${
                pathname === link.href
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
