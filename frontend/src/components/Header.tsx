'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { siteConfig } from '@/config/site'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#about', label: 'About' },
  ]

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.97)' : 'rgba(0, 0, 0, 0.25)',
        backdropFilter: scrolled ? 'blur(16px)' : 'blur(4px)',
        borderBottom: scrolled ? '1px solid rgba(212, 175, 55, 0.15)' : '1px solid transparent',
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="djs-logo">
          {siteConfig.branding.logoText}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wider uppercase transition-colors duration-200 hover:text-gold-primary"
              style={{ color: 'rgba(245,245,245,0.8)', letterSpacing: '0.08em' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#d4af37')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,245,245,0.8)')}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/booking" className="button button-primary text-sm px-6 py-2">
            Book Now
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium tracking-wider uppercase transition-colors duration-200"
            style={{ color: 'rgba(245,245,245,0.6)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#d4af37')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,245,245,0.6)')}
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <motion.div
            animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="w-6 h-px bg-gold-primary"
            style={{ backgroundColor: '#d4af37' }}
          />
          <motion.div
            animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-6 h-px"
            style={{ backgroundColor: '#d4af37' }}
          />
          <motion.div
            animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="w-6 h-px"
            style={{ backgroundColor: '#d4af37' }}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.98)',
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    className="text-sm uppercase tracking-widest transition-colors duration-200"
                    style={{ color: 'rgba(245,245,245,0.8)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/booking"
                className="button button-primary text-sm text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
              <Link
                href="/login"
                className="text-sm uppercase tracking-widest"
                style={{ color: 'rgba(245,245,245,0.5)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
