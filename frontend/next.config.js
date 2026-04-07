/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'danielsilva.photo', 'cdn.example.com'],
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_',
  },
}

module.exports = nextConfig
