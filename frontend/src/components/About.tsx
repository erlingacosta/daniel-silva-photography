'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AboutData {
  photographer_name?: string
  bio?: string
  photo_url?: string
  events_photographed?: number
  years_experience?: number
  client_satisfaction?: number
}

const DEFAULT_ABOUT: AboutData = {
  photographer_name: 'Daniel Silva',
  bio: 'Daniel Silva is a passionate photographer dedicated to capturing life\'s most important moments. With over 15 years of experience, he specializes in wedding, quinceañera, and event photography.',
  photo_url: '/images/daniel-silva.jpg',
  events_photographed: 500,
  years_experience: 15,
  client_satisfaction: 100,
}

export default function About() {
  const [about, setAbout] = useState<AboutData>(DEFAULT_ABOUT)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const response = await fetch(`${API_URL}/about`)
      if (response.ok) {
        const data = await response.json()
        setAbout(data)
      }
    } catch (err) {
      console.error('Error loading about data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="about"
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: '#0f0f0f',
        borderTop: '1px solid rgba(212,175,55,0.12)',
        borderBottom: '1px solid rgba(212,175,55,0.12)',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: '#c4a574', letterSpacing: '0.3em' }}
          >
            Our Story
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light mb-6"
            style={{ color: '#f5f5f5', fontFamily: 'Playfair Display, serif' }}
          >
            About {about.photographer_name || 'Daniel Silva'}
          </h2>
          <div
            className="w-16 h-1 mx-auto"
            style={{ backgroundColor: '#c4a574' }}
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {about.photo_url && (
              <img
                src={about.photo_url}
                alt={about.photographer_name || 'Photographer'}
                className="w-full h-96 object-cover rounded-lg"
                style={{ borderLeft: '4px solid #c4a574' }}
              />
            )}
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="space-y-6">
              <p
                className="text-lg leading-relaxed"
                style={{ color: '#b0b0b0' }}
              >
                {about.bio || DEFAULT_ABOUT.bio}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <p
                    className="text-4xl font-bold mb-2"
                    style={{ color: '#c4a574' }}
                  >
                    {about.events_photographed || 500}+
                  </p>
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: '#555' }}
                  >
                    Events Photographed
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <p
                    className="text-4xl font-bold mb-2"
                    style={{ color: '#c4a574' }}
                  >
                    {about.years_experience || 15}+
                  </p>
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: '#555' }}
                  >
                    Years of Experience
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <p
                    className="text-4xl font-bold mb-2"
                    style={{ color: '#c4a574' }}
                  >
                    {about.client_satisfaction || 100}%
                  </p>
                  <p
                    className="text-xs uppercase tracking-widest"
                    style={{ color: '#555' }}
                  >
                    Client Satisfaction
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
