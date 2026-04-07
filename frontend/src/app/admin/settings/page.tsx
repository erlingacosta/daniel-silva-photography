'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SiteSettings {
  site_name: string
  tagline: string
  contact_email: string
  contact_phone: string
  instagram_url: string
  facebook_url: string
  location: string
  booking_email: string
}

const defaults: SiteSettings = {
  site_name: 'Daniel Silva Photography',
  tagline: 'Premium Wedding & Event Photography',
  contact_email: 'info@danielsilvaphotography.com',
  contact_phone: '+1 (555) 123-4567',
  instagram_url: 'https://instagram.com/danielsilvaphoto',
  facebook_url: 'https://facebook.com/danielsilvaphoto',
  location: 'Southwest United States',
  booking_email: 'bookings@danielsilvaphotography.com',
}

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<SiteSettings>(defaults)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // In production, this would POST to a settings endpoint
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#0d0d0d',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '4px',
    color: '#f5f5f5',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    color: '#888',
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: '6px',
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
      <h2 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '600', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {title}
      </h2>
      {children}
    </div>
  )

  const Field = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: keyof SiteSettings; type?: string; placeholder?: string }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        style={inputStyle}
        value={settings[field]}
        onChange={e => setSettings({ ...settings, [field]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div style={{ padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <p style={{ color: '#d4af37', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '8px' }}>Configuration</p>
          <h1 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 'bold' }}>Settings</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {saved && (
            <motion.p
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: '#66cc88', fontSize: '13px' }}
            >
              Saved ✓
            </motion.p>
          )}
          <button
            onClick={handleSave}
            style={{
              padding: '10px 24px',
              backgroundColor: '#d4af37',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(212,175,55,0.12)', margin: '24px 0' }} />

      <div style={{ maxWidth: '640px' }}>
        <Section title="Site Identity">
          <Field label="Site Name" field="site_name" placeholder="Daniel Silva Photography" />
          <Field label="Tagline" field="tagline" placeholder="Premium Wedding & Event Photography" />
          <Field label="Location / Region" field="location" placeholder="Southwest United States" />
        </Section>

        <Section title="Contact Information">
          <Field label="Primary Email" field="contact_email" type="email" placeholder="info@danielsilvaphotography.com" />
          <Field label="Bookings Email" field="booking_email" type="email" placeholder="bookings@danielsilvaphotography.com" />
          <Field label="Phone Number" field="contact_phone" type="tel" placeholder="+1 (555) 123-4567" />
        </Section>

        <Section title="Social Media">
          <Field label="Instagram URL" field="instagram_url" placeholder="https://instagram.com/..." />
          <Field label="Facebook URL" field="facebook_url" placeholder="https://facebook.com/..." />
        </Section>

        <div style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '6px', padding: '20px' }}>
          <h2 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Admin Account</h2>
          <p style={{ color: '#555', fontSize: '13px', marginBottom: '12px' }}>
            To change your password or email, contact the system administrator or update the backend database directly.
          </p>
          <p style={{ color: '#444', fontSize: '12px', lineHeight: '1.6' }}>
            Token-based authentication is active. Your session token is stored in the browser&apos;s localStorage as <code style={{ color: '#777' }}>djs_token</code>.
            Logging out will clear all stored credentials.
          </p>
        </div>
      </div>
    </div>
  )
}
