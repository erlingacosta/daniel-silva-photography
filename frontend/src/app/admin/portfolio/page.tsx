'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const CATEGORIES = ['wedding', 'quinceañera', 'event', 'portrait']

interface PortfolioItem {
  id: number
  title: string
  description: string
  category: string
  image_url: string
  thumbnail_url: string
}

interface FormData {
  title: string
  description: string
  category: string
  image_url: string
}

const emptyForm: FormData = { title: '', description: '', category: 'wedding', image_url: '' }

function authHeaders() {
  const token = localStorage.getItem('djs_token')
  return { Authorization: `Bearer ${token}` }
}

export default function PortfolioAdmin() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/portfolios`)
      setItems(res.data)
    } catch {
      setError('Failed to load portfolio items.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const openAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const openEdit = (item: PortfolioItem) => {
    setForm({ title: item.title, description: item.description, category: item.category, image_url: item.image_url })
    setEditingId(item.id)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url.trim()) {
      setError('Title and image URL are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/portfolios/${editingId}`,
          form,
          { headers: authHeaders() }
        )
        setSuccess('Portfolio item updated.')
      } else {
        await axios.post(
          `${API_URL}/api/portfolios`,
          null,
          {
            params: { title: form.title, description: form.description, category: form.category, image_url: form.image_url },
            headers: authHeaders(),
          }
        )
        setSuccess('Portfolio item added.')
      }
      setShowForm(false)
      fetchItems()
    } catch {
      setError('Failed to save. Check that the backend is running.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/portfolios/${id}`, { headers: authHeaders() })
      setDeleteConfirm(null)
      setSuccess('Item deleted.')
      fetchItems()
    } catch {
      setError('Failed to delete item.')
    }
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

  const labelStyle = { color: '#888', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: '6px' }

  return (
    <div style={{ padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <p style={{ color: '#d4af37', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '8px' }}>Content</p>
          <h1 style={{ color: '#f5f5f5', fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 'bold' }}>Portfolio</h1>
        </div>
        <button
          onClick={openAdd}
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
          + Add Item
        </button>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(212,175,55,0.12)', margin: '24px 0' }} />

      {/* Alerts */}
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

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '32px' }}
          >
            <div style={{ backgroundColor: '#111', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '6px', padding: '28px' }}>
              <h2 style={{ color: '#f5f5f5', fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
                {editingId ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    style={inputStyle}
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Wedding at Sunset"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} style={{ backgroundColor: '#111' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Image URL *</label>
                <input
                  style={inputStyle}
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  placeholder="/images/wedding/photo.jpg or https://..."
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of this portfolio item..."
                />
              </div>

              {/* Preview */}
              {form.image_url && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Preview</label>
                  <img
                    src={form.image_url}
                    alt="preview"
                    style={{ width: '160px', height: '120px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.15)' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '10px 28px',
                    backgroundColor: saving ? '#555' : '#d4af37',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: saving ? 'default' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : (editingId ? 'Update Item' : 'Add Item')}
                </button>
                <button
                  onClick={() => { setShowForm(false); setError('') }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#777',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items List */}
      {loading ? (
        <p style={{ color: '#555', fontSize: '13px' }}>Loading portfolio items...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px' }}>No portfolio items yet.</p>
          <button onClick={openAdd} style={{ color: '#d4af37', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
            Add your first item →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              style={{
                backgroundColor: '#111',
                border: '1px solid rgba(212,175,55,0.08)',
                borderRadius: '6px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Thumbnail */}
              <div style={{ width: '72px', height: '54px', flexShrink: 0, borderRadius: '3px', overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>{item.title}</p>
                <p style={{ color: '#555', fontSize: '12px' }}>{item.description}</p>
              </div>

              {/* Category badge */}
              <span style={{
                padding: '3px 10px',
                backgroundColor: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '20px',
                color: '#d4af37',
                fontSize: '11px',
                flexShrink: 0,
              }}>
                {item.category}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(item)}
                  style={{ padding: '6px 14px', backgroundColor: 'transparent', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37', borderRadius: '3px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                {deleteConfirm === item.id ? (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ color: '#cc6666', fontSize: '12px' }}>Sure?</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ padding: '5px 12px', backgroundColor: 'rgba(180,40,40,0.3)', border: '1px solid rgba(180,40,40,0.4)', color: '#cc6666', borderRadius: '3px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{ padding: '5px 10px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#777', borderRadius: '3px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    style={{ padding: '6px 14px', backgroundColor: 'transparent', border: '1px solid rgba(180,40,40,0.25)', color: '#cc6666', borderRadius: '3px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
