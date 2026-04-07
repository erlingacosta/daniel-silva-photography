'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="djs-logo text-lg mb-4">DJS</div>
            <p className="text-gray-400 text-sm">
              Premium photography for life's most important moments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="text-gray-400 space-y-2 text-sm">
              <li>
                <Link href="#portfolio" className="hover:text-gold transition">
                  Weddings
                </Link>
              </li>
              <li>
                <Link href="#portfolio" className="hover:text-gold transition">
                  Quinceañeras
                </Link>
              </li>
              <li>
                <Link href="#portfolio" className="hover:text-gold transition">
                  Events
                </Link>
              </li>
              <li>
                <Link href="#portfolio" className="hover:text-gold transition">
                  Portraits
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="text-gray-400 space-y-2 text-sm">
              <li>
                <Link href="#about" className="hover:text-gold transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-gold transition">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-gold transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gold transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a
                href="#"
                className="text-gold hover:text-white transition"
                aria-label="Instagram"
              >
                📷 Instagram
              </a>
              <a
                href="#"
                className="text-gold hover:text-white transition"
                aria-label="Facebook"
              >
                👥 Facebook
              </a>
            </div>
            <a href="mailto:contact@danielsilva.photo" className="text-gray-400 hover:text-gold transition text-sm">
              contact@danielsilva.photo
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 Daniel Silva Photography. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
