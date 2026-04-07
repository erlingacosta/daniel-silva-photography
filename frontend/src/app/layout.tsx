import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Daniel Silva Photography | Premium Wedding & Event Photography',
  description: 'Premium photography services for weddings, quinceañeras, events, and portraits.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dark-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
