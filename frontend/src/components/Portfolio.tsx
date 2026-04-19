'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QuinceañeraGallery from './QuinceañeraGallery'
import WeddingGallery from './WeddingGallery'

const serviceTypes = ['All', 'Weddings', 'Quinceañeras', 'Events', 'Portraits']

const defaultPortfolio = [
  {
    id: 1,
    title: 'Wedding Ceremony & First Dance',
    category: 'Weddings',
    type: 'video' as const,
    src: '/videos/wedding-ceremony-first-dance.mp4',
    poster: '/images/wedding-ceremony-still.jpg?v=2',
    cinematic: true,
  },
  {
    id: 2,
    title: 'Quinceañera — Golden Hour',
    category: 'Quinceañeras',
    type: 'image' as const,
    src: '/images/quinceanera/quince-01-v2.jpg?v=2',
    cinematic: true,
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

type PortfolioItem = {
  id: number
  title: string
  category: string
  type: 'video' | 'image'
  src: string
  poster?: string
  cinematic: boolean
}

function CinematicCard({ item, onClick }: { item: PortfolioItem; onClick: () => void }) {
  return (
    <motion.div
      variants={cardVariants}
      className="gallery-item group cursor-pointer overflow-hidden"
      onClick={onClick}
      style={{ position: 'relative' }}
    >
      <motion.div
        className="w-full h-full"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformOrigin: 'center center' }}
      >
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-full object-cover"
          style={{ display: 'block' }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background:
            'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 50%, rgba(212,175,55,0.05) 100%)',
        }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
      >
        <span
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: '#c4a574', letterSpacing: '0.2em' }}
        >
          {item.category}
        </span>
        <p className="text-white text-center font-semibold text-sm">{item.title}</p>
      </div>
    </motion.div>
  )
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(defaultPortfolio)
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selected, setSelected] = useState<PortfolioItem | null>(null)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/portfolios`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            const mapped = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              category: item.category || 'Events',
              type: 'image' as const,
              src: item.image_url || item.src,
              poster: item.thumbnail_url,
              cinematic: true,
            }))
            setPortfolio(mapped)
          }
        }
      } catch (err) {
        console.error('Failed to fetch portfolio:', err)
      }
    }
    fetchPortfolio()
  }, [])

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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-4"
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#c4a574', letterSpacing: '0.4em' }}>
            Our Work
          </p>
          <h2 className="section-title">Portfolio</h2>
        </motion.div>
        <div className="section-divider" />

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
                backgroundColor: activeCategory === service ? '#c4a574' : 'transparent',
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

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="gallery-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((item) => (
              <CinematicCard key={item.id} item={item} onClick={() => openLightbox(item)} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

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
              <img src={selected.src} alt={selected.title} />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-2xl font-light transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c4a574')}
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
