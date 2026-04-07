'use client'

import React from 'react'
import { motion } from 'framer-motion'

const stats = [
  { value: '500+', label: 'Events Photographed' },
  { value: '15+', label: 'Years of Experience' },
  { value: '100%', label: 'Client Satisfaction' },
]

export default function About() {
  return (
    <section id="about" className="py-24" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-4"
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#d4af37', letterSpacing: '0.4em' }}>
            The Artist
          </p>
          <h2 className="section-title">About Daniel Silva</h2>
        </motion.div>
        <div className="section-divider" />

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            {/* Gold frame accent */}
            <div
              className="absolute -inset-3 rounded-lg"
              style={{ border: '1px solid rgba(212,175,55,0.2)' }}
            />
            <div
              className="absolute -top-3 -left-3 w-16 h-16 rounded-tl-lg"
              style={{ borderTop: '2px solid #d4af37', borderLeft: '2px solid #d4af37' }}
            />
            <div
              className="absolute -bottom-3 -right-3 w-16 h-16 rounded-br-lg"
              style={{ borderBottom: '2px solid #d4af37', borderRight: '2px solid #d4af37' }}
            />
            <img
              src="/images/daniel-silva.jpg"
              alt="Daniel Silva"
              className="rounded-lg w-full relative z-10"
              style={{ filter: 'brightness(0.9) contrast(1.05)' }}
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          >
            <h3
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: '#f5f5f5' }}
            >
              Premium Photography
              <br />
              <span style={{ color: '#d4af37' }}>Since 2009</span>
            </h3>

            <div className="space-y-4 mb-8">
              <p className="leading-relaxed" style={{ color: '#b0b0b0' }}>
                Daniel Silva is a passionate photographer dedicated to capturing life's most
                important moments. With over 15 years of experience, he specializes in wedding,
                quinceañera, and event photography.
              </p>
              <p className="leading-relaxed" style={{ color: '#b0b0b0' }}>
                His approach combines technical expertise with artistic vision, ensuring every
                photo tells a story. Daniel believes in building genuine relationships with
                clients to understand and deliver on their unique vision.
              </p>
              <p className="leading-relaxed" style={{ color: '#b0b0b0' }}>
                When not behind the camera, Daniel mentors emerging photographers and explores
                new locations for stunning backdrops across the Southwest.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="text-center py-4 rounded"
                  style={{ border: '1px solid rgba(212,175,55,0.15)' }}
                >
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "'Playfair Display', serif", color: '#d4af37' }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-wider" style={{ color: '#777777', letterSpacing: '0.08em' }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
