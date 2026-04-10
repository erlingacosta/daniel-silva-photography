'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Booking {
  id: number
  client_email: string
  package: string
  event_date: string | null
  status: string
  total_price: number
  created_at: string
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(212,175,55,0.1)', color: '#d4af37' },
  confirmed: { bg: 'rgba(40,180,80,0.1)', color: '#66cc88' },
  completed: { bg: 'rgba(80,120,200,0.1)', color: '#88aadd' },
  cancelled: { bg: 'rgba(180,40,40,0.1)', color: '#cc6666' },
}

const ALL_STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<'event_date' | 'created_at' | 'total_price'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchBookings()
  }, [])

