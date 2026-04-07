'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const heroImages = [
  '/images/hero-wedding-1.jpg',
  '/images/hero-wedding-2.jpg',
  '/images/hero-quinceañera.jpg',
  '/images/hero-event.jpg',
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero mt-20">
      <div className="hero-carousel">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img
              src={image}
              alt={`Hero slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="hero-overlay">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Daniel Silva Photography
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Premium wedding, quinceañera, and event photography
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/booking" className="button button-primary">
              Book Your Event
            </Link>
            <Link href="#portfolio" className="button button-secondary">
              View Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentSlide ? 'bg-gold' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
