'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FaqItem {
  id: number
  question: string
  answer: string
}

const defaultFaqItems = [
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
      'You can typically expect to receive edited photos within 4–6 weeks of your event. Rush processing is available for an additional fee.',
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
  const [faqItems, setFaqItems] = useState<FaqItem[]>(defaultFaqItems)

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/faq`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            setFaqItems(data)
          }
        }
      } catch (err) {
        console.error('Failed to fetch FAQ:', err)
      }
    }
    fetchFaq()
  }, [])

  return (
    <section className="py-24" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-3xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-4"
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#c4a574', letterSpacing: '0.4em' }}>
            Questions
          </p>
          <h2 className="section-title">FAQ</h2>
        </motion.div>
        <div className="section-divider" />

        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="w-full px-6 py-5 text-left flex justify-between items-center transition-colors duration-200"
                style={{
                  backgroundColor: openId === item.id ? '#1e1e1e' : '#1a1a1a',
                }}
              >
                <span className="font-medium pr-4" style={{ color: '#f5f5f5' }}>
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: openId === item.id ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 text-xl font-light"
                  style={{ color: '#c4a574' }}
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      className="px-6 py-5"
                      style={{
                        backgroundColor: '#161616',
                        borderTop: '1px solid rgba(212,175,55,0.1)',
                      }}
                    >
                      <p className="leading-relaxed text-sm" style={{ color: '#b0b0b0' }}>
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
