'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const contactInfo = [
  {
    icon: '✉',
    label: 'Email Us',
    value: 'contact@danielsilva.photo',
    href: 'mailto:contact@danielsilva.photo',
  },
  {
    icon: '✆',
    label: 'Call Us',
    value: '(405) 555-0100',
    href: 'tel:+14055550100',
  },
  {
    icon: '◷',
    label: 'Response Time',
    value: 'Within 24 Hours',
    href: null,
  },
]

export default function BookingCTA() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Gold accent lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }}
      />

      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: '#d4af37', letterSpacing: '0.4em' }}
          >
            Let's Create Together
          </p>
          <h2
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: "'Playfair Display', serif", color: '#f5f5f5' }}
          >
            Ready to Book
            <br />
            <span style={{ color: '#d4af37' }}>Your Event?</span>
          </h2>

          <div className="w-16 h-px mx-auto my-8" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />

          <p className="text-lg mb-12 max-w-2xl mx-auto font-light" style={{ color: '#b0b0b0' }}>
            Let's create stunning memories together. Get in touch to check availability
            and discuss your vision.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-16">
            <Link href="/booking" className="button button-primary text-base px-10 py-4">
              Book Now
            </Link>
            <Link href="#contact" className="button button-secondary text-base px-10 py-4">
              Contact Us
            </Link>
          </div>
        </motion.div>

        {/* Contact info */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {contactInfo.map((info) => (
            <div
              key={info.label}
              className="rounded-lg p-8"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(212,175,55,0.15)',
              }}
            >
              <p className="text-2xl mb-3" style={{ color: '#d4af37' }}>{info.icon}</p>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#777777', letterSpacing: '0.15em' }}>
                {info.label}
              </p>
              {info.href ? (
                <a
                  href={info.href}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: '#d4af37' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f0d060')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#d4af37')}
                >
                  {info.value}
                </a>
              ) : (
                <p className="text-sm font-medium" style={{ color: '#d4af37' }}>{info.value}</p>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
