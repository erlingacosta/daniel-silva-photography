'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AboutData {
  photo_url: string
  bio_heading: string
  bio_since: string
  bio_paragraphs: string[]
  stats: Array<{ value: string; label: string }>
}

const defaultAbout: AboutData = {
  photo_url: '/images/daniel-silva.jpg',
  bio_heading: 'Premium Photography',
  bio_since: 'Since 2009',
  bio_paragraphs: [
    "Daniel Silva is a passionate photographer dedicated to capturing life's most important moments. With over 15 years of experience, he specializes in wedding, quinceañera, and event photography.",
    "His approach combines technical expertise with artistic vision, ensuring every photo tells a story. Daniel believes in building genuine relationships with clients to understand and deliver on their unique vision.",
    "When not behind the camera, Daniel mentors emerging photographers and explores new locations for stunning backdrops across the Southwest.",
  ],
  stats: [
    { value: '500+', label: 'Events Photographed' },
    { value: '15+', label: 'Years of Experience' },
    { value: '100%', label: 'Client Satisfaction' },
  ],
}

export default function AboutAdmin() {
  const [data, setData] = useState<AboutData>(defaultAbout)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const token = localStorage.getItem('djs_token')
        const res = await axios.get(`${API_URL}/admin/about`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setData(res.data)
      } catch {
        // Use defaults if endpoint not available
      } finally {
        setLoading(false)
      }
    }
    fetchAbout()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('djs_token')
      await axios.put(`${API_URL}/admin/about`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('About section saved successfully.')
    } catch {
      setError('Failed to save. Changes are stored locally for now.')
    } finally {
      setSaving(false)
    }
  }

  const updateParagraph = (index: number, value: string) => {
    const updated = [...data.bio_paragraphs]
    updated[index] = value
    setData({ ...data, bio_paragraphs: updated })
  }

  const addParagraph = () => {
    setData({ ...data, bio_paragraphs: [...data.bio_paragraphs, ''] })
  }

  const removeParagraph = (index: number) => {
    const updated = data.bio_paragraphs.filter((_, i) => i !== index)
    setData({ ...data, bio_paragraphs: updated })
  }

  const updateStat = (index: number, field: 'value' | 'label', val: string) => {
    const updated = [...data.stats]
    updated[index] = { ...updated[index], [field]: val }
    setData({ ...data, stats: updated })
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

  if (loading) {
    return <div style={{ padding: '40px 48px', color: '#555', fontSize: '13px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <p style={{ color: '#d4af37', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '8px' }}>Content</p>
          <h1 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 'bold' }}>About Section</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#d4af37',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px',
              backgroundColor: saving ? '#555' : '#d4af37',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(212,175,55,0.12)', margin: '24px 0' }} />

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(180,40,40,0.1)', border: '1px solid rgba(180,40,40,0.2)', borderRadius: '4px', marginBottom: '20px' }}>
          <p style={{ color: '#cc6666', fontSize: '13px' }}>{error}</p>
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(40,180,80,0.08)', border: '1px solid rgba(40,180,80,0.2)', borderRadius: '4px', marginBottom: '20px' }}>
          <p style={{ color: '#66cc88', fontSize: '13px' }}>{success}</p>
        </div>
      )}

      {/* Live Preview */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginBottom: '32px', overflow: 'hidden' }}
        >
          <div style={{ backgroundColor: '#111111', borderRadius: '8px', padding: '40px', border: '1px solid rgba(212,175,55,0.1)' }}>
            <p style={{ color: '#d4af37', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>The Artist</p>
            <h2 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>About Daniel Silva</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '4px' }}>
                  <img
                    src={data.photo_url}
                    alt="Daniel Silva"
                    style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '6px', filter: 'brightness(0.9) contrast(1.05)' }}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              </div>
              <div>
                <h3 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>
                  {data.bio_heading} <span style={{ color: '#d4af37' }}>{data.bio_since}</span>
                </h3>
                {data.bio_paragraphs.map((p, i) => (
                  <p key={i} style={{ color: '#b0b0b0', fontSize: '13px', lineHeight: '1.7', marginBottom: '12px' }}>{p}</p>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
                  {data.stats.map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '12px', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '4px' }}>
                      <p style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 'bold' }}>{s.value}</p>
                      <p style={{ color: '#777', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Left column */}
        <div>
          {/* Photo */}
          <div style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>Profile Photo</h2>

            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <img
                src={data.photo_url}
                alt="Daniel Silva"
                style={{ width: '160px', height: '200px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.2)' }}
                onError={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.display = 'block' }}
              />
            </div>

            <label style={labelStyle}>Photo URL</label>
            <input
              style={inputStyle}
              value={data.photo_url}
              onChange={e => setData({ ...data, photo_url: e.target.value })}
              placeholder="/images/daniel-silva.jpg"
            />
            <p style={{ color: '#444', fontSize: '11px', marginTop: '6px' }}>
              Place photos in <code style={{ color: '#777' }}>frontend/public/images/</code> and reference as <code style={{ color: '#777' }}>/images/filename.jpg</code>
            </p>
          </div>

          {/* Stats */}
          <div style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '6px', padding: '24px' }}>
            <h2 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>Statistics</h2>
            {data.stats.map((stat, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Value</label>
                  <input
                    style={inputStyle}
                    value={stat.value}
                    onChange={e => updateStat(i, 'value', e.target.value)}
                    placeholder="500+"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Label</label>
                  <input
                    style={inputStyle}
                    value={stat.label}
                    onChange={e => updateStat(i, 'label', e.target.value)}
                    placeholder="Events Photographed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Heading */}
          <div style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>Section Heading</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Heading</label>
                <input
                  style={inputStyle}
                  value={data.bio_heading}
                  onChange={e => setData({ ...data, bio_heading: e.target.value })}
                  placeholder="Premium Photography"
                />
              </div>
              <div>
                <label style={labelStyle}>Since / Tagline</label>
                <input
                  style={inputStyle}
                  value={data.bio_since}
                  onChange={e => setData({ ...data, bio_since: e.target.value })}
                  placeholder="Since 2009"
                />
              </div>
            </div>
          </div>

          {/* Bio Paragraphs */}
          <div style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '6px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '600' }}>Bio Text</h2>
              <button
                onClick={addParagraph}
                style={{ padding: '4px 12px', backgroundColor: 'transparent', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}
              >
                + Add Paragraph
              </button>
            </div>
            {data.bio_paragraphs.map((para, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Paragraph {i + 1}</label>
                  {data.bio_paragraphs.length > 1 && (
                    <button
                      onClick={() => removeParagraph(i)}
                      style={{ color: '#cc6666', background: 'none', border: 'none', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <textarea
                  style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                  value={para}
                  onChange={e => updateParagraph(i, e.target.value)}
                  placeholder="Write a paragraph about Daniel Silva..."
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
