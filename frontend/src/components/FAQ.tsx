'use client'

import React, { useState } from 'react'

const faqItems = [
  {
    id: 1,
    question: 'What is included in each package?',
    answer:
      'Each package includes professional photography, edited high-resolution images, cloud backup, and gallery access. Premium packages include additional services like a second photographer or videography.',
  },
  {
    id: 2,
    question: 'How long does it take to receive photos?',
    answer:
      'You can typically expect to receive edited photos within 4-6 weeks of your event. Rush processing is available for an additional fee.',
  },
  {
    id: 3,
    question: 'Can you accommodate multiple locations?',
    answer:
      'Yes! We love shooting at multiple locations. The Elite package includes multiple location coverage. Additional locations can be added to other packages for $300 per location.',
  },
  {
    id: 4,
    question: 'Do you offer videography?',
    answer:
      'Yes, videography is included in the Premium Plus and Elite packages. Videography can also be added separately for $1,500.',
  },
  {
    id: 5,
    question: 'What is your cancellation policy?',
    answer:
      'Cancellations made more than 60 days in advance receive a full refund. Cancellations within 60 days forfeit the deposit. Rescheduling is available within one year.',
  },
  {
    id: 6,
    question: 'Do you provide engagement or pre-event shoots?',
    answer:
      'Yes! Engagement shoots are available for $500 and are the perfect way to get comfortable in front of the camera before your big day.',
  },
]

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="section-title">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900">{item.question}</span>
                <span className="text-gold text-2xl">
                  {openId === item.id ? '−' : '+'}
                </span>
              </button>

              {openId === item.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
