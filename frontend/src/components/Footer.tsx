'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LogoCircle from './LogoCircle'
import { siteConfig } from '@/config/site'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="py-16" style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <LogoCircle width={126} height={126} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#666666' }}>
              Premium photography for life's most important moments.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={siteConfig.social.instagram}
                className="text-xs uppercase tracking-wider transition-colors duration-200"
                style={{ color: 'rgba(212,175,55,0.6)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c4a574')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(212,175,55,0.6)')}
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href={siteConfig.social.facebook}
                className="text-xs uppercase tracking-wider transition-colors duration-200"
                style={{ color: 'rgba(212,175,55,0.6)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c4a574')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(212,175,55,0.6)')}
                aria-label="Facebook"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-5 font-semibold" style={{ color: '#c4a574', letterSpacing: '0.2em' }}>
              Services
            </h4>
            <ul className="space-y-3">
              {['Weddings', 'Quinceañeras', 'Events', 'Portraits'].map((service) => (
                <li key={service}>
                  <Link
                    href="#portfolio"
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#666666' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#c4a574')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-5 font-semibold" style={{ color: '#c4a574', letterSpacing: '0.2em' }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About', href: '#about' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Book Now', href: '/inquiry' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#666666' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#c4a574')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-5 font-semibold" style={{ color: '#c4a574', letterSpacing: '0.2em' }}>
              Contact
            </h4>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-sm block mb-2 transition-colors duration-200"
              style={{ color: '#666666' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c4a574')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
            >
              {siteConfig.contact.email}
            </a>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\D/g, '')}`}
              className="text-sm block transition-colors duration-200"
              style={{ color: '#666666' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c4a574')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
            >
              {siteConfig.contact.phone}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
          style={{ borderTop: '1px solid rgba(212,175,55,0.1)', color: '#444444' }}
        >
          <p>
            &copy; {year} {siteConfig.branding.name}. All rights reserved.
          </p>
          <p style={{ color: '#333333' }}>
            Crafted with precision
          </p>
        </div>
      </div>
    </footer>
  )
}
