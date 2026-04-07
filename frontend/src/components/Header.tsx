'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-black text-white z-40 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/djs-logo.png"
            alt="DJS Photography"
            width={40}
            height={40}
            className="h-10 w-10"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="#portfolio" className="hover:text-gold transition">
            Portfolio
          </Link>
          <Link href="#pricing" className="hover:text-gold transition">
            Pricing
          </Link>
          <Link href="#testimonials" className="hover:text-gold transition">
            Testimonials
          </Link>
          <Link href="#about" className="hover:text-gold transition">
            About
          </Link>
          <Link href="/booking" className="button button-primary text-sm">
            Book Now
          </Link>
          <Link href="/login" className="hover:text-gold transition">
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="w-6 h-0.5 bg-gold"></div>
          <div className="w-6 h-0.5 bg-gold"></div>
          <div className="w-6 h-0.5 bg-gold"></div>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gold px-4 py-4">
          <div className="flex flex-col gap-4">
            <Link href="#portfolio" className="hover:text-gold transition">
              Portfolio
            </Link>
            <Link href="#pricing" className="hover:text-gold transition">
              Pricing
            </Link>
            <Link href="#testimonials" className="hover:text-gold transition">
              Testimonials
            </Link>
            <Link href="#about" className="hover:text-gold transition">
              About
            </Link>
            <Link href="/booking" className="button button-primary text-sm inline-block">
              Book Now
            </Link>
            <Link href="/login" className="hover:text-gold transition">
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
