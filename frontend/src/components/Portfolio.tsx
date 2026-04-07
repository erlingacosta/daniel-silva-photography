'use client'

import React, { useState } from 'react'

const serviceTypes = ['All', 'Weddings', 'Quinceañeras', 'Events', 'Portraits']

const portfolio = [
  {
    id: 1,
    title: 'Wedding at La Hacienda',
    category: 'Weddings',
    image: '/images/wedding-1.jpg',
    thumbnail: '/images/wedding-1-thumb.jpg',
  },
  {
    id: 2,
    title: 'Quinceañera Celebration',
    category: 'Quinceañeras',
    image: '/images/quinceañera-1.jpg',
    thumbnail: '/images/quinceañera-1-thumb.jpg',
  },
  {
    id: 3,
    title: 'Corporate Gala',
    category: 'Events',
    image: '/images/event-1.jpg',
    thumbnail: '/images/event-1-thumb.jpg',
  },
  {
    id: 4,
    title: 'Professional Portrait',
    category: 'Portraits',
    image: '/images/portrait-1.jpg',
    thumbnail: '/images/portrait-1-thumb.jpg',
  },
  {
    id: 5,
    title: 'Beach Wedding',
    category: 'Weddings',
    image: '/images/wedding-2.jpg',
    thumbnail: '/images/wedding-2-thumb.jpg',
  },
  {
    id: 6,
    title: 'Family Photos',
    category: 'Portraits',
    image: '/images/portrait-2.jpg',
    thumbnail: '/images/portrait-2-thumb.jpg',
  },
]

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<typeof portfolio[0] | null>(null)

  const filteredPortfolio =
    activeCategory === 'All'
      ? portfolio
      : portfolio.filter((item) => item.category === activeCategory)

  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-title">Our Portfolio</h2>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {serviceTypes.map((service) => (
            <button
              key={service}
              onClick={() => setActiveCategory(service)}
              className={`px-6 py-2 rounded transition ${
                activeCategory === service
                  ? 'bg-gold text-black'
                  : 'border-2 border-gold text-gold hover:bg-gold hover:text-black'
              }`}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {filteredPortfolio.map((item) => (
            <div
              key={item.id}
              className="gallery-item"
              onClick={() => {
                setSelectedImage(item)
                setLightboxOpen(true)
              }}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                <p className="text-white text-center font-semibold">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedImage && (
        <div
          className="lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gold transition"
            >
              ✕
            </button>
            <p className="text-white text-center mt-4">{selectedImage.title}</p>
          </div>
        </div>
      )}
    </section>
  )
}
