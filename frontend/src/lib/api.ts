import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.danielsilvaphotography.com/api'

export const publicApi = axios.create({ baseURL: API_URL })

export const adminApi = axios.create({ baseURL: API_URL })

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('djs_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API_URL
