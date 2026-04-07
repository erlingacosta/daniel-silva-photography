'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const images = [
  {
    src: '/images/quinceañera/quince-01-new.jpg',
    alt: 'Quinceañera in golden field with sparkly gown',
  },
  {
    src: '/images/quinceañera/quince-02-new.jpg',
    alt: 'Quinceañera glamour shot by rocks with bouquet',
  },
  {
    src: '/images/quinceañera/quince-03-new.jpg',
    alt: 'Quinceañera with floral backdrop in white gown',
  },
  {
    src: '/images/quinceañera/quince-04-new.jpg',
    alt: 'Quinceañera in sparkly red dress by cactus',
  },
  {
    src: '/images/quinceañera/quince-05-new.jpg',
    alt: 'Quinceañera in pale blue gown in forest',
  },
]

export default function QuinceañeraGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="w-full">
      {/* Main carousel */}
      <div className="relative w-full aspect-square overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
            {/* Vignette overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 transition-colors duration-200"
          style={{
            backgroundColor: 'rgba(212, 175, 55, 0.2)',
            color: '#d4af37',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '1px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)')}
          aria-label="Previous image"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 transition-colors duration-200"
          style={{
            backgroundColor: 'rgba(212, 175, 55, 0.2)',
            color: '#d4af37',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '1px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)')}
          aria-label="Next image"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
          </svg>
        </motion.button>
      </div>

      {/* Thumbnail indicators */}
      <div className="flex justify-center gap-3 mt-6">
        {images.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-16 h-16 overflow-hidden border transition-all duration-200"
            style={{
              borderColor: index === currentIndex ? '#d4af37' : 'rgba(212, 175, 55, 0.3)',
              borderWidth: index === currentIndex ? '2px' : '1px',
            }}
            aria-label={`Go to image ${index + 1}`}
          >
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              className="object-cover opacity-70 hover:opacity-100 transition-opacity duration-300"
              sizes="64px"
            />
          </motion.button>
        ))}
      </div>

      {/* Image counter */}
      <div className="text-center mt-4 text-xs uppercase tracking-widest" style={{ color: '#b0b0b0' }}>
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
