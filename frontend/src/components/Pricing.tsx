'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface PricingPackage {
  id?: number
  name: string
  price: number
  duration?: string
  includes: string[]
  featured?: boolean
}

interface AlaCarteService {
  id: number
  name: string
  price: number
  description: string
}

const defaultPackages: PricingPackage[] = [
  {
    name: 'Signature',
    price: 4500,
    duration: '8 hours',
    includes: ['Professional photographer', 'High-resolution photos', '500+ edited images', 'Cloud backup', 'Web gallery access'],
  },
  {
    name: 'Premium Plus',
    price: 6200,
    duration: '12 hours',
    includes: ['Everything in Signature', 'Second photographer', 'Engagement photos', 'Videography (highlights)', 'Premium album', 'Unlimited gallery access'],
    featured: true,
  },
  {
    name: 'Elite',
    price: 8500,
    duration: '16 hours',
    includes: ['Everything in Premium Plus', 'Drone photography', 'Full-length video', 'Multiple locations', 'Print packages included', 'VIP consultation', 'Lifetime gallery access'],
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Pricing() {
  const [packages, setPackages] = useState<PricingPackage[]>(defaultPackages)
  const [services, setServices] = useState<AlaCarteService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        const pkgResponse = await fetch(`${API_URL}/api/packages`)
        if (pkgResponse.ok) {
          const data = await pkgResponse.json()
          if (data && data.length > 0) {
            const mapped = data.map((pkg: any, idx: number) => ({
              id: pkg.id,
              name: pkg.name,
              price: pkg.price,
              duration: `${idx === 0 ? '8' : idx === 1 ? '12' : '16'} hours`,
              includes: pkg.deliverables ? pkg.deliverables.split(',').map((d: string) => d.trim()) : [],
              featured: idx === 1,
            }))
            setPackages(mapped)
          }
        }
        
        const svcResponse = await fetch(`${API_URL}/api/ala-carte`)
        if (svcResponse.ok) {
          const data = await svcResponse.json()
          if (data && data.length > 0) {
            setServices(data)
          }
        }
      } catch (err) {
        console.error('Failed to fetch pricing data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <section id="pricing" className="py-24" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-4"
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#d4af37', letterSpacing: '0.4em' }}>
            Investment
          </p>
          <h2 className="section-title">Pricing Packages</h2>
          <p className="section-subtitle mt-2">Transparent pricing for premium photography services</p>
        </motion.div>
        <div className="section-divider" />

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {packages.map((pkg: PricingPackage) => (
            <motion.div key={pkg.name} variants={cardVariants} className={`pricing-card ${pkg.featured ? 'featured' : ''}`}>
              {pkg.featured && (
                <p className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color: '#d4af37', letterSpacing: '0.3em' }}>
                  Most Popular
                </p>
              )}
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#f5f5f5' }}>
                {pkg.name}
              </h3>
              <p className="text-sm uppercase tracking-wider mb-4" style={{ color: '#d4af37', letterSpacing: '0.15em' }}>
                {pkg.duration}
              </p>
              <p className="text-4xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif", color: '#f5f5f5' }}>
                ${pkg.price.toLocaleString()}
              </p>

              <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />

              <ul className="text-left mb-8 space-y-3">
                {pkg.includes.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-0.5 text-sm font-bold flex-shrink-0" style={{ color: '#d4af37' }}>✓</span>
                    <span className="text-sm" style={{ color: '#b0b0b0' }}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/inquiry" className="button button-primary w-full inline-block text-center text-sm">
                Book Now
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 max-w-2xl mx-auto rounded-lg p-8"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <h3 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", color: '#f5f5f5' }}>
            À La Carte Services
          </h3>
          <ul className="space-y-3">
            {services.length > 0 ? (
              services.map((service: AlaCarteService) => (
                <li key={service.id} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: '#b0b0b0' }}>{service.name}</span>
                    {service.description && <p className="text-xs" style={{ color: '#666' }}>{service.description}</p>}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#d4af37' }}>${service.price}</span>
                </li>
              ))
            ) : (
              [
                ['Pre-wedding engagement shoot', '$500'],
                ['Additional hours (per hour)', '$400'],
                ['Drone footage package', '$800'],
                ['Premium hardcover album', '$600'],
                ['Rush delivery', '$400'],
              ].map(([name, price]) => (
                <li key={name} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                  <span className="text-sm" style={{ color: '#b0b0b0' }}>{name}</span>
                  <span className="text-sm font-semibold" style={{ color: '#d4af37' }}>{price}</span>
                </li>
              ))
            )}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
