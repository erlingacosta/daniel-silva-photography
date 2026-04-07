'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const serviceTypes = ['All', 'Weddings', 'Quinceañeras', 'Events', 'Portraits']

const portfolio = [
  {
    id: 1,
    title: 'Wedding Ceremony & First Dance',
    category: 'Weddings',
    type: 'video',
    src: '/videos/01_wedding_ceremony_first_dance.mp4',
  },
  {
    id: 2,
    title: 'Quinceañera Glamour Reel',
    category: 'Quinceañeras',
    type: 'video',
    src: '/videos/02_quinceañera_glamour.mp4',
  },
  {
    id: 3,
    title: 'Event Photography Highlights',
    category: 'Events',
    type: 'video',
    src: '/videos/03_event_highlights.mp4',
  },
  {
    id: 4,
    title: 'Cinematic Portrait Session',
    category: 'Portraits',
    type: 'video',
    src: '/videos/04_portrait_cinematic.mp4',
  },
  {
    id: 5,
    title: 'La Hacienda Wedding',
    category: 'Weddings',
    type: 'image',
    src: '/images/wedding-2.jpg',
  },
  {
    id: 6,
    title: 'Family Portrait Collection',
    category: 'Portraits',
    type: 'image',
    src: '/images/portrait-2.jpg',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

type PortfolioItem = typeof portfolio[0]

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selected, setSelected] = useState<PortfolioItem | null>(null)

  const filtered =
    activeCategory === 'All'
      ? portfolio
      : portfolio.filter((item) => item.category === activeCategory)

  const openLightbox = (item: PortfolioItem) => {
    setSelected(item)
    setLightboxOpen(true)
  }

  return (
    <section id="portfolio" className="py-24" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-4"
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#d4af37', letterSpacing: '0.4em' }}>
            Our Work
          </p>
          <h2 className="section-title">Portfolio</h2>
        </motion.div>
        <div className="section-divider" />

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-3 mb-12 flex-wrap"
        >
          {serviceTypes.map((service) => (
            <button
              key={service}
              onClick={() => setActiveCategory(service)}
              className="px-6 py-2 rounded text-sm uppercase tracking-wider transition-all duration-300"
              style={{
                backgroundColor: activeCategory === service ? '#d4af37' : 'transparent',
                color: activeCategory === service ? '#0f0f0f' : 'rgba(212,175,55,0.8)',
                border: '1px solid rgba(212,175,55,0.5)',
                letterSpacing: '0.08em',
                fontWeight: activeCategory === service ? 600 : 400,
              }}
            >
              {service}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="gallery-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                className="gallery-item group"
                onClick={() => openLightbox(item)}
                whileHover={{ scale: 1.01 }}
              >
                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                  />
                ) : (
                  <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                )}

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
                >
                  <span
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{ color: '#d4af37', letterSpacing: '0.2em' }}
                  >
                    {item.category}
                  </span>
                  <p className="text-white text-center font-semibold text-sm">{item.title}</p>
                  <p className="text-xs mt-2 uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.6)' }}>
                    {item.type === 'video' ? '▶ Play' : '⊕ View'}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              {selected.type === 'video' ? (
                <video src={selected.src} controls autoPlay className="w-full max-h-[85vh]" />
              ) : (
                <img src={selected.src} alt={selected.title} />
              )}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-2xl font-light transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#d4af37')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >
                ✕
              </button>
              <p
                className="text-center mt-4 text-sm tracking-wider uppercase"
                style={{ color: '#b0b0b0' }}
              >
                {selected.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
