'use client'

import React from 'react'
import { motion } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    name: 'Maria & Juan',
    text: 'Daniel captured our wedding day beautifully. His professionalism and creativity were outstanding. We could not be happier with our photos!',
    rating: 5,
    service: 'Wedding Photography',
  },
  {
    id: 2,
    name: 'Sofia R.',
    text: 'My quinceañera was perfect, and Daniel made sure every moment was documented beautifully. The photos are absolutely stunning!',
    rating: 5,
    service: 'Quinceañera Photography',
  },
  {
    id: 3,
    name: 'The Garcia Family',
    text: 'Professional, creative, and incredibly easy to work with. Daniel has a gift for capturing genuine moments and emotions.',
    rating: 5,
    service: 'Family Portraits',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-4"
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#c4a574', letterSpacing: '0.4em' }}>
            Client Stories
          </p>
          <h2 className="section-title">Testimonials</h2>
        </motion.div>
        <div className="section-divider" />

        {/* Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="rounded-lg p-8 flex flex-col"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(212,175,55,0.15)',
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} style={{ color: '#c4a574' }}>★</span>
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-sm leading-relaxed mb-8 italic flex-1"
                style={{ color: '#b0b0b0' }}
              >
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Attribution */}
              <div
                className="pt-6"
                style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}
              >
                <p className="font-semibold" style={{ color: '#f5f5f5' }}>{testimonial.name}</p>
                <p className="text-xs uppercase tracking-wider mt-1" style={{ color: '#c4a574', letterSpacing: '0.15em' }}>
                  {testimonial.service}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 rounded-lg p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a, #1e1e1e)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: '#c4a574', letterSpacing: '0.4em' }}
          >
            As Featured In
          </p>
          <p className="font-light mb-4" style={{ color: '#b0b0b0' }}>
            ABC News &nbsp;·&nbsp; Local Wedding Magazine &nbsp;·&nbsp; Photography Awards
          </p>
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: '#f5f5f5' }}
          >
            500+ Satisfied Clients · 15+ Years of Excellence
          </p>
        </motion.div>
      </div>
    </section>
  )
}
