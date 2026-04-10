'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FaqItem {
  id: number
  question: string
  answer: string
  is_active: boolean
  order: number
}

export default function FaqPage() {
  const router = useRouter()
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editData, setEditData] = useState({ question: '', answer: '', is_active: true, order: 0 })
  const [createData, setCreateData] = useState({ question: '', answer: '', is_active: true })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchFaqs()
  }, [router])

  const fetchFaqs = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/admin/faq`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch FAQs')
      const data = await response.json()
      setFaqs(data)
      setError('')
    } catch (err) {
      setError('Error loading FAQs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFaq = async () => {
    if (!createData.question || !createData.answer) {
      setError('Question and answer are required')
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/admin/faq`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      })
      if (!response.ok) throw new Error('Failed to create FAQ')
      const newFaq = await response.json()
      setFaqs([...faqs, newFaq])
      setCreateData({ question: '', answer: '', is_active: true })
      setIsCreating(false)
      setError('')
    } catch (err) {
      setError('Error creating FAQ')
      console.error(err)
    }
  }

  const handleUpdateFaq = async () => {
    if (!selectedFaq) return
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/admin/faq/${selectedFaq.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })
      if (!response.ok) throw new Error('Failed to update FAQ')
      const updatedFaq = await response.json()
      setFaqs(faqs.map(f => f.id === updatedFaq.id ? updatedFaq : f))
      setSelectedFaq(updatedFaq)
      setIsEditing(false)
      setError('')
    } catch (err) {
      setError('Error updating FAQ')
      console.error(err)
    }
  }

  const handleDeleteFaq = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/admin/faq/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to delete FAQ')
      setFaqs(faqs.filter(f => f.id !== id))
      if (selectedFaq?.id === id) setSelectedFaq(null)
      setError('')
    } catch (err) {
      setError('Error deleting FAQ')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <p className="text-center">Loading FAQs...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">FAQ Management</h1>
            <p className="text-slate-400">Manage frequently asked questions</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">
            ← Back
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {isCreating ? (
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">New FAQ</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Question"
                    value={createData.question}
                    onChange={(e) => setCreateData({ ...createData, question: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                  <textarea
                    placeholder="Answer"
                    rows={4}
                    value={createData.answer}
                    onChange={(e) => setCreateData({ ...createData, answer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={createData.is_active}
                      onChange={(e) => setCreateData({ ...createData, is_active: e.target.checked })}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateFaq}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">FAQs ({faqs.length})</h2>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  + New FAQ
                </button>
              </div>
              <div className="divide-y divide-slate-700">
                {faqs.map(faq => (
                  <div
                    key={faq.id}
                    onClick={() => setSelectedFaq(faq)}
                    className={`p-4 cursor-pointer hover:bg-slate-700 transition-colors ${
                      selectedFaq?.id === faq.id ? 'bg-slate-700' : ''
                    }`}
                  >
                    <p className="font-semibold text-white">{faq.question}</p>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedFaq && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">FAQ Details</h2>
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Question</p>
                    <p className="text-white font-semibold">{selectedFaq.question}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Answer</p>
                    <p className="text-white text-sm mt-2 p-3 bg-slate-700 rounded whitespace-pre-wrap">
                      {selectedFaq.answer}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <p className="text-white">
                      {selectedFaq.is_active ? '🟢 Active' : '⚫ Inactive'}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        setEditData({
                          question: selectedFaq.question,
                          answer: selectedFaq.answer,
                          is_active: selectedFaq.is_active,
                          order: selectedFaq.order,
                        })
                        setIsEditing(true)
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(selectedFaq.id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editData.question}
                    onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                  <textarea
                    rows={4}
                    value={editData.answer}
                    onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.is_active}
                      onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateFaq}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
