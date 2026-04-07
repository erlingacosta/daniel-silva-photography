'use client'

import React from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Maria & Juan',
    text: 'Daniel captured our wedding day beautifully. His professionalism and creativity were outstanding. We could not be happier with our photos!',
    rating: 5,
    service: 'Wedding Photography',
    image: '/images/testimonial-1.jpg',
  },
  {
    id: 2,
    name: 'Sofia',
    text: 'My quinceañera was perfect, and Daniel made sure every moment was documented perfectly. The photos are absolutely stunning!',
    rating: 5,
    service: 'Quinceañera Photography',
    image: '/images/testimonial-2.jpg',
  },
  {
    id: 3,
    name: 'The Garcia Family',
    text: 'Professional, creative, and incredibly easy to work with. Daniel has a gift for capturing genuine moments and emotions.',
    rating: 5,
    service: 'Family Portraits',
    image: '/images/testimonial-3.jpg',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-title">Client Testimonials</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 p-8 rounded-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-gold text-xl">★</span>
                ))}
              </div>

              <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>

              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.service}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-100 p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-2">Featured In</h3>
          <p className="text-gray-700 mb-4">
            ABC News • Local Wedding Magazine • Photography Awards
          </p>
          <p className="text-gray-600">
            Over 500+ satisfied clients and 15+ years of experience
          </p>
        </div>
      </div>
    </section>
  )
}
