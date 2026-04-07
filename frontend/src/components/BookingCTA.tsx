'use client'

import React from 'react'
import Link from 'next/link'

export default function BookingCTA() {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-5xl font-bold mb-6">Ready to Book Your Event?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Let's create stunning memories together. Get in touch to check availability and
          discuss your vision.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/booking" className="button button-primary text-lg px-8 py-4">
            Book Now
          </Link>
          <Link href="#contact" className="button button-secondary text-lg px-8 py-4">
            Contact Us
          </Link>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div>
            <p className="text-gold text-2xl font-bold mb-2">📧</p>
            <p className="text-gray-300">
              Email us at
              <br />
              <a href="mailto:contact@danielsilva.photo" className="text-gold hover:underline">
                contact@danielsilva.photo
              </a>
            </p>
          </div>
          <div>
            <p className="text-gold text-2xl font-bold mb-2">📱</p>
            <p className="text-gray-300">
              Call us
              <br />
              <a href="tel:+15551234567" className="text-gold hover:underline">
                (555) 123-4567
              </a>
            </p>
          </div>
          <div>
            <p className="text-gold text-2xl font-bold mb-2">⏱️</p>
            <p className="text-gray-300">
              Response time
              <br />
              <span className="text-gold">Within 24 hours</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
