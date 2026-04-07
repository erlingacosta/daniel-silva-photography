'use client'

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Portfolio from '@/components/Portfolio'
import Pricing from '@/components/Pricing'
import Testimonials from '@/components/Testimonials'
import BookingCTA from '@/components/BookingCTA'
import About from '@/components/About'
import FAQ from '@/components/FAQ'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Portfolio />
      <Pricing />
      <Testimonials />
      <About />
      <BookingCTA />
      <FAQ />
      <Newsletter />
      <Footer />
    </main>
  )
}
