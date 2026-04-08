/** @type {import('next').NextConfig} */

// Ensure NEXT_PUBLIC_API_URL is available at build time
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('⚠️  NEXT_PUBLIC_API_URL not set at build time. Using https://www.danielsilvaphotography.com/api as fallback.')
}

const nextConfig = {
  images: {
    domains: ['localhost', 'danielsilva.photo', 'www.danielsilva.photo', 'cdn.example.com'],
    unoptimized: false,
  },
  // Explicitly set environment variables for build time
  // NEXT_PUBLIC_API_URL defaults to production URL to ensure correct backend calls
  // Local dev: set NEXT_PUBLIC_API_URL=http://localhost:8000 before running dev server
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://www.danielsilvaphotography.com/api',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_',
  },
  
  // Note: NEXT_PUBLIC_ variables are baked into the build at compile time in Next.js
  // They cannot be changed at runtime without a rebuild
  // To update the API URL in production, you MUST rebuild the frontend with the new env var set
  
  // Optional: Add API rewrites if deploying frontend and backend together on same domain
  // For now, using direct fetch/axios calls with NEXT_PUBLIC_API_URL works with CORS
  // rewrites: async () => [
  //   {
  //     source: '/api/:path*',
  //     destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
  //   },
  // ],
}

module.exports = nextConfig
