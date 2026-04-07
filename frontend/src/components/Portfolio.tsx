'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QuinceañeraGallery from './QuinceañeraGallery'
import WeddingGallery from './WeddingGallery'

const serviceTypes = ['All', 'Weddings', 'Quinceañeras', 'Events', 'Portraits']

const portfolio = [
  {
    id: 1,
    title: 'Wedding Ceremony & First Dance',
    category: 'Weddings',
    type: 'video' as const,
    src: '/videos/wedding-ceremony-first-dance.mp4',
    poster: '/images/wedding-ceremony-still.jpg',
    cinematic: true,
  },
  {
    id: 2,
    title: 'Quinceañera — Golden Hour',
    category: 'Quinceañeras',
    type: 'image' as const,
    src: '/images/quinceanera-still-1.jpg',
    cinematic: true,
  },
  {
    id: 3,
    title: 'Quinceañera — Glamour Close-Up',
    category: 'Quinceañeras',
    type: 'image' as const,
    src: '/images/quinceanera-still-2.jpg',
    cinematic: true,
  },
  {
    id: 4,
    title: 'Event Photography Highlights',
    category: 'Events',
    type: 'image' as const,
    src: '/images/event-highlights-still.jpg',
    cinematic: false,
  },
  {
    id: 5,
    title: 'Cinematic Portrait — Natural Light',
    category: 'Portraits',
    type: 'image' as const,
    src: '/images/portrait-cinematic-still-1.jpg',
    cinematic: true,
  },
  {
    id: 6,
    title: 'Cinematic Portrait — Studio',
    category: 'Portraits',
    type: 'image' as const,
    src: '/images/portrait-cinematic-still-2.jpg',
    cinematic: true,
  },
  {
    id: 7,
    title: 'La Hacienda Wedding',
    category: 'Weddings',
    type: 'image' as const,
    src: '/images/wedding-2.jpg',
    cinematic: false,
  },
  {
    id: 8,
    title: 'Family Portrait Collection',
    category: 'Portraits',
    type: 'image' as const,
    src: '/images/portrait-2.jpg',
    cinematic: false,
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

function VideoCard({ item, onClick }: { item: PortfolioItem; onClick: () => void }) {
  return (
    <motion.div
      variants={cardVariants}
      className="gallery-item group cursor-pointer overflow-hidden relative"
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformOrigin: 'center center' }}
      >
        <video
          src={item.src}
          poster={item.poster}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      </motion.div>

      {/* Gold shimmer overlay on hover */}
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

      {/* Hover info overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
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
          ▶ Play
        </p>
      </div>

      {/* Video badge */}
      <div
        className="absolute top-3 left-3 px-2 py-1 text-xs uppercase tracking-widest"
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(212,175,55,0.4)',
          color: '#d4af37',
          letterSpacing: '0.15em',
          fontSize: '9px',
        }}
      >
        ▶ Video
      </div>
    </motion.div>
  )
}

function CinematicCard({ item, onClick }: { item: PortfolioItem; onClick: () => void }) {
  return (
    <motion.div
      variants={cardVariants}
      className="gallery-item group cursor-pointer overflow-hidden"
      onClick={onClick}
      style={{ position: 'relative' }}
    >
      {/* Cinematic zoom on hover via CSS transform */}
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

      {/* Gold shimmer overlay on hover */}
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

      {/* Hover info overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
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
          ⊕ View
        </p>
      </div>

      {/* Cinematic badge */}
      <div
        className="absolute top-3 left-3 px-2 py-1 text-xs uppercase tracking-widest"
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(212,175,55,0.4)',
          color: '#d4af37',
          letterSpacing: '0.15em',
          fontSize: '9px',
        }}
      >
        Cinematic
      </div>
    </motion.div>
  )
}

function StandardCard({ item, onClick }: { item: PortfolioItem; onClick: () => void }) {
  return (
    <motion.div
      variants={cardVariants}
      className="gallery-item group cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      style={{ position: 'relative' }}
    >
      <img src={item.src} alt={item.title} className="w-full h-full object-cover" />

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
          ⊕ View
        </p>
      </div>
    </motion.div>
  )
}

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

  // For Quinceañeras category, show carousel at top
  const quincItems = filtered.filter((i) => i.category === 'Quinceañeras')
  const showQuincPair = activeCategory === 'Quinceañeras' && quincItems.length >= 2
  // For Weddings category, show carousel at top
  const weddingItems = filtered.filter((i) => i.category === 'Weddings')
  const showWeddingCarousel = activeCategory === 'Weddings' && weddingItems.length > 0
  // When viewing Quinceañeras or Weddings, don't show the individual items since gallery is displayed
  const otherItems = showQuincPair
    ? filtered.filter((i) => i.category !== 'Quinceañeras')
    : showWeddingCarousel
      ? filtered.filter((i) => i.category !== 'Weddings')
      : filtered

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

        {/* Wedding cinematic gallery carousel */}
        <AnimatePresence>
          {showWeddingCarousel && (
            <motion.div
              key="wedding-carousel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <p
                className="text-center text-xs uppercase tracking-widest mb-8"
                style={{ color: 'rgba(212,175,55,0.6)', letterSpacing: '0.3em' }}
              >
                Featured Weddings
              </p>
              <div className="max-w-3xl mx-auto">
                <WeddingGallery />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quinceañera cinematic gallery carousel */}
        <AnimatePresence>
          {showQuincPair && (
            <motion.div
              key="quinc-carousel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <p
                className="text-center text-xs uppercase tracking-widest mb-8"
                style={{ color: 'rgba(212,175,55,0.6)', letterSpacing: '0.3em' }}
              >
                Cinematic Gallery
              </p>
              <div className="max-w-3xl mx-auto">
                <QuinceañeraGallery />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="gallery-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {(showQuincPair || showWeddingCarousel ? otherItems : filtered).map((item) =>
              item.type === 'video' ? (
                <VideoCard key={item.id} item={item} onClick={() => openLightbox(item)} />
              ) : item.cinematic ? (
                <CinematicCard key={item.id} item={item} onClick={() => openLightbox(item)} />
              ) : (
                <StandardCard key={item.id} item={item} onClick={() => openLightbox(item)} />
              )
            )}
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
              <img src={selected.src} alt={selected.title} />
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
