'use client'

import React from 'react'

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="section-title">About Daniel Silva</h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/images/about-daniel.jpg"
              alt="Daniel Silva"
              className="rounded-lg shadow-lg w-full"
            />
          </div>

          <div>
            <h3 className="text-3xl font-bold mb-6 text-gray-900">
              Premium Photography Since 2009
            </h3>

            <p className="text-gray-700 mb-4 leading-relaxed">
              Daniel Silva is a passionate photographer dedicated to capturing life's most
              important moments. With over 15 years of experience, he specializes in wedding,
              quinceañera, and event photography.
            </p>

            <p className="text-gray-700 mb-4 leading-relaxed">
              His approach combines technical expertise with artistic vision, ensuring every
              photo tells a story. Daniel believes in building genuine relationships with
              clients and understanding their unique vision.
            </p>

            <p className="text-gray-700 mb-6 leading-relaxed">
              When not behind the camera, Daniel loves mentoring other photographers and
              exploring new locations for stunning backdrops.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">500+</p>
                <p className="text-sm text-gray-600">Events Photographed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">15+</p>
                <p className="text-sm text-gray-600">Years Experience</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gold">100%</p>
                <p className="text-sm text-gray-600">Client Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
