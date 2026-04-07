'use client'

import React from 'react'
import Link from 'next/link'

const packages = [
  {
    name: 'Signature',
    price: 4500,
    duration: '8 hours',
    includes: [
      'Professional photographer',
      'High-resolution photos',
      '500+ edited images',
      'Cloud backup',
      'Web gallery access',
    ],
  },
  {
    name: 'Premium Plus',
    price: 6200,
    duration: '12 hours',
    includes: [
      'Everything in Signature',
      'Second photographer',
      'Engagement photos',
      'Videography (highlights)',
      'Premium album',
      'Unlimited gallery access',
    ],
    featured: true,
  },
  {
    name: 'Elite',
    price: 8500,
    duration: '16 hours',
    includes: [
      'Everything in Premium Plus',
      'Drone photography',
      'Full-length video',
      'Multiple locations',
      'Print packages included',
      'VIP consultation',
      'Lifetime gallery access',
    ],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-title">Pricing Packages</h2>
        <p className="section-subtitle">
          Transparent pricing for premium photography services
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`pricing-card ${pkg.featured ? 'featured' : ''}`}
            >
              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <p className="text-gold font-semibold mb-1">{pkg.duration}</p>
              <p className="text-4xl font-bold mb-6 text-gray-900">
                ${pkg.price.toLocaleString()}
              </p>

              <ul className="text-left mb-8 space-y-3">
                {pkg.includes.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gold mr-3 font-bold">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/booking" className="button button-primary w-full inline-block text-center">
                Book Now
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Additional Services</h3>
          <ul className="space-y-3 text-gray-700">
            <li>• Pre-wedding engagement shoot: $500</li>
            <li>• Additional hours (per hour): $400</li>
            <li>• Drone footage package: $800</li>
            <li>• Premium hardcover album: $600</li>
            <li>• High-res file packages: $400</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
