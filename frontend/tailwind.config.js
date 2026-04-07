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
        // Luxury dark theme
        'dark-primary': '#0f0f0f',
        'dark-secondary': '#1a1a1a',
        'dark-card': '#2a2a2a',
        'gold-primary': '#d4af37',
        'gold-secondary': '#c9a961',
        'text-primary': '#f5f5f5',
        'text-secondary': '#b0b0b0',
        gold: '#d4af37',
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
