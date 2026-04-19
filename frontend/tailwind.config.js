/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Elegant pastel palette
        'dark-primary': '#0f0f0f',
        'dark-secondary': '#1a1a1a',
        'dark-card': '#2a2a2a',
        'camel': '#c4a574',
        'camel-accent': '#d4a574',
        'camel-deep': '#b89560',
        'beige': '#f5f1e8',
        'ivory': '#fafaf8',
        // Legacy aliases (mapped to new palette)
        'gold-primary': '#c4a574',
        'gold-secondary': '#b89560',
        'text-primary': '#f5f5f5',
        'text-secondary': '#b0b0b0',
        gold: '#c4a574',
        navy: '#1a1a2e',
        dark: '#0f0f0f',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      backgroundColor: {
        'dark': '#0f0f0f',
        'dark-card': '#2a2a2a',
      },
      textColor: {
        'dark': '#0f0f0f',
        'text-primary': '#f5f5f5',
        'text-secondary': '#b0b0b0',
      },
    },
  },
  plugins: [],
}
