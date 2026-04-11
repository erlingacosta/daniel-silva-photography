'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { publicApi } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await publicApi.post('/auth/register', form)
      const { access_token } = res.data
      localStorage.setItem('client_token', access_token)
      if (res.data.user) {
        localStorage.setItem('client_user', JSON.stringify(res.data.user))
      }
      router.push('/client')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white tracking-widest uppercase">Create Account</h1>
          <p className="text-neutral-400 mt-2 text-sm">Join the Daniel Silva Photography client portal</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-neutral-900 rounded-lg p-8 space-y-5 border border-neutral-800">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              placeholder="Choose a password"
            />
          </div>
          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              placeholder="(optional)"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded uppercase tracking-wider text-sm transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-neutral-500 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-amber-400 hover:text-amber-300">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  )
}
