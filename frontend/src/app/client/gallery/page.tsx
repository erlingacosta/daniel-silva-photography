'use client'

import { useEffect, useState } from 'react'
import { clientApi } from '@/lib/api'

interface GalleryPhoto {
  id: number
  image_url: string
  caption: string | null
  created_at: string | null
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)

  useEffect(() => {
    clientApi.get('/client/gallery')
      .then((res) => setPhotos(res.data))
      .catch(() => setError('Failed to load gallery.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-neutral-400">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-light text-white tracking-wide mb-2">Your Gallery</h1>
      <p className="text-neutral-500 text-sm mb-8">Your private photos from Daniel Silva Photography</p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {photos.length === 0 && !error && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-neutral-400">Your gallery is empty.</p>
          <p className="text-neutral-600 text-sm mt-2">Photos will appear here once Daniel has processed your event.</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square bg-neutral-900 rounded-lg overflow-hidden cursor-pointer border border-neutral-800 hover:border-amber-500/50 transition"
              onClick={() => setSelected(photo)}
            >
              <img
                src={photo.image_url}
                alt={photo.caption || 'Gallery photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-white text-xs truncate">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.image_url}
              alt={selected.caption || 'Gallery photo'}
              className="w-full max-h-[80vh] object-contain rounded"
            />
            {selected.caption && (
              <p className="text-white text-center mt-3 text-sm">{selected.caption}</p>
            )}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 text-white hover:text-amber-400 text-2xl font-light"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
