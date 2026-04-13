'use client'

import { useRef, useState } from 'react'
import { adminApi } from '@/lib/api'

export default function HeroSettingsPage() {
  const [hero, setHero] = useState({ video_url: '/videos/05_hero_luxury_montage.mp4', updated_at: null })
  const [videoUrl, setVideoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadHero = async () => {
    try {
      const res = await adminApi.get('/admin/hero')
      setHero(res.data)
      setVideoUrl(res.data.video_url)
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await adminApi.post('/admin/hero/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setHero(res.data)
      setVideoUrl(res.data.video_url)
      alert('Video uploaded successfully!')
    } catch (e) {
      console.error(e)
      alert('Failed to upload video')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSave = async () => {
    if (!videoUrl.trim()) {
      alert('Please enter a video URL')
      return
    }

    setSaving(true)
    try {
      const res = await adminApi.post('/admin/hero', { video_url: videoUrl })
      setHero(res.data)
      alert('Hero video updated!')
    } catch (e) {
      console.error(e)
      alert('Failed to update hero video')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Hero Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Hero Video</h2>

        {/* Preview */}
        {hero.video_url && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <video
              src={hero.video_url}
              controls
              className="w-full max-w-2xl rounded-lg bg-black"
            />
          </div>
        )}

        {/* Current URL */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Current Video URL</label>
          <p className="text-gray-700 font-mono text-sm break-all">{hero.video_url}</p>
          {hero.updated_at && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(hero.updated_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Upload */}
        <div className="mb-6 border-t pt-6">
          <label className="block text-sm font-semibold mb-3">Upload New Video</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">Videos will be saved to /videos/ folder in Spaces</p>
        </div>

        {/* Manual URL Update */}
        <div className="mb-6 border-t pt-6">
          <label className="block text-sm font-semibold mb-2">Or Update Video URL Manually</label>
          <input
            type="text"
            placeholder="/videos/your-video.mp4"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Video URL'}
          </button>
        </div>
      </div>
    </div>
  )
}
