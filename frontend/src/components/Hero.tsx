'use client'

import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [videoSrc, setVideoSrc] = useState('/videos/ea7efcdd91d440ffb3528c90da4c19da.mp4')

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    // Fetch hero video URL from API
    const fetchHeroVideo = async () => {
      try {
        const res = await fetch('/api/hero')
        if (res.ok) {
          const data = await res.json()
          if (data.video_url) {
            setVideoSrc(data.video_url)
          }
        }
      } catch (e) {
        console.error('Failed to fetch hero video:', e)
        // Fall back to default
        setVideoSrc('/videos/ea7efcdd91d440ffb3528c90da4c19da.mp4')
      }
    }
    fetchHeroVideo()
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [videoSrc])

  return (
    <section ref={sectionRef} className="hero">
      {/* Video background with parallax */}
      <motion.div className="absolute inset-0 w-full h-full" style={{ y }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </motion.div>

      {/* Dark gradient overlay */}
      <div className="hero-overlay">
        <motion.div
          className="text-center text-white px-4 max-w-5xl"
          style={{ opacity }}
        >
          {/* Eyebrow text */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.3em' }}
            animate={{ opacity: 1, letterSpacing: '0.5em' }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-xs md:text-sm uppercase tracking-widest text-gold-primary mb-6 font-light"
            style={{ color: '#c4a574' }}
          >
            Premium Photography
          </motion.p>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Daniel Silva
            <br />
            <span style={{ color: '#c4a574' }}>Photography</span>
          </motion.h1>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="w-24 h-px mx-auto mb-8"
            style={{ background: 'linear-gradient(90deg, transparent, #c4a574, transparent)' }}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-lg md:text-2xl mb-12 max-w-2xl mx-auto font-light leading-relaxed"
            style={{ color: 'rgba(245,245,245,0.85)' }}
          >
            Weddings · Quinceañeras · Events · Portraits
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.7 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link href="/inquiry" className="button button-primary px-10 py-4 text-base">
              Book Your Event
            </Link>
            <Link href="#portfolio" className="button button-secondary px-10 py-4 text-base">
              View Portfolio
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(196,165,116,0.7)' }}>
          Scroll
        </p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-px h-12"
          style={{ background: 'linear-gradient(to bottom, #c4a574, transparent)' }}
        />
      </motion.div>
    </section>
  )
}
