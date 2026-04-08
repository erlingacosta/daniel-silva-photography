'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type LoginForm = {
  email: string
  password: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setServerError('')
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: data.email,
        password: data.password,
      })
      const { access_token, user } = res.data
      localStorage.setItem('djs_token', access_token)
      localStorage.setItem('djs_user', JSON.stringify(user))
      // Redirect to admin dashboard on successful login
      router.push('/admin')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.detail || 'Invalid email or password.')
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0f0f0f' }}
    >
      {/* Background subtle grain / vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-10"
        >
          <Link href="/">
            <span
              className="djs-logo text-2xl tracking-widest cursor-pointer"
              style={{ color: '#d4af37' }}
            >
              Daniel Silva
            </span>
          </Link>
          <p
            className="text-xs uppercase tracking-widest mt-1"
            style={{ color: '#b0b0b0', letterSpacing: '0.3em' }}
          >
            Photography
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(212,175,55,0.15)',
            borderRadius: '2px',
          }}
          className="px-8 py-10"
        >
          <h1
            className="text-2xl font-light text-center mb-1"
            style={{ color: '#f5f5f5', fontFamily: 'Playfair Display, serif' }}
          >
            Client Login
          </h1>
          <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: '#b0b0b0' }}>
            Access your portal
          </p>

          {/* Gold divider */}
          <div
            className="mx-auto mb-8"
            style={{ width: '40px', height: '1px', backgroundColor: '#d4af37' }}
          />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: '#b0b0b0', letterSpacing: '0.15em' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required.',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email.' },
                })}
                className="w-full px-4 py-3 text-sm outline-none transition-all duration-300"
                style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: '#f5f5f5',
                  borderRadius: '1px',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)')}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs" style={{ color: '#e07070' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: '#b0b0b0', letterSpacing: '0.15em' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required.',
                  minLength: { value: 6, message: 'Password must be at least 6 characters.' },
                })}
                className="w-full px-4 py-3 text-sm outline-none transition-all duration-300"
                style={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: '#f5f5f5',
                  borderRadius: '1px',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)')}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: '#e07070' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 px-4 py-3 text-sm text-center"
                style={{
                  backgroundColor: 'rgba(220,60,60,0.1)',
                  border: '1px solid rgba(220,60,60,0.3)',
                  color: '#e07070',
                  borderRadius: '1px',
                }}
              >
                {serverError}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
              className="w-full py-3 text-sm uppercase tracking-widest font-semibold transition-all duration-300"
              style={{
                backgroundColor: isLoading ? 'rgba(212,175,55,0.5)' : '#d4af37',
                color: '#0f0f0f',
                borderRadius: '1px',
                letterSpacing: '0.2em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-6 text-xs"
          style={{ color: '#b0b0b0' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/#contact"
            className="transition-colors duration-200"
            style={{ color: '#d4af37' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#d4af37')}
          >
            Contact us to get started
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-3"
        >
          <Link
            href="/"
            className="text-xs uppercase tracking-widest transition-colors duration-200"
            style={{ color: 'rgba(176,176,176,0.5)', letterSpacing: '0.2em' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#d4af37')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(176,176,176,0.5)')}
          >
            ← Back to site
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
