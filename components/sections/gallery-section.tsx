'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ArrowUpRight } from 'lucide-react'

interface GalleryPhoto {
  id: string
  title: string
  image_url: string
  description?: string | null
  category?: string | null
  location?: string | null
  photo_date?: string | null
  tags?: Array<{ id: string; tag: string }> | null
  is_featured?: boolean | null
}

interface GallerySectionProps {
  photos: GalleryPhoto[]
}

function PhotoCard({ photo }: { photo: GalleryPhoto }) {
  return (
    <div className="group rounded-lg overflow-hidden border border-white/[0.1] bg-zinc-950 hover:border-white/[0.2] transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-zinc-900">
        <Image
          src={photo.image_url}
          alt={photo.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="w-full">
            <h3 className="text-white font-semibold text-lg mb-2">{photo.title}</h3>
            {photo.description && (
              <p className="text-zinc-200 text-sm line-clamp-2">{photo.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {/* <div className="p-4 space-y-3">
        <h3 className="text-white font-semibold text-lg line-clamp-1">{photo.title}</h3>


        <div className="space-y-2 text-sm">
          {photo.category && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Category:</span>
              <span className="text-zinc-300">{photo.category}</span>
            </div>
          )}

          {photo.location && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Location:</span>
              <span className="text-zinc-300">{photo.location}</span>
            </div>
          )}

          {photo.photo_date && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Date:</span>
              <span className="text-zinc-300">
                {new Date(photo.photo_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>


        {photo.tags && photo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {photo.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                {tag.tag}
              </span>
            ))}
          </div>
        )}
      </div> */}
    </div>
  )
}

export function GallerySection({ photos }: GallerySectionProps) {
  const [showAll, setShowAll] = useState(false)

  if (!photos || photos.length === 0) return null

  // Filter to show featured photos first, fallback to first 6
  const featured = photos.filter((p) => p.is_featured)
  const displayPhotos = featured.length > 0 ? featured : photos.slice(0, 6)
  const hasMorePhotos = photos.length > displayPhotos.length

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Gallery</h2>
          <p className="text-lg text-zinc-400">A collection of moments and experiences</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>

        {/* View All Button */}
        {hasMorePhotos && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/[0.2] hover:bg-white/[0.05]"
            >
              View All Gallery
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Full-Screen Modal */}
      {showAll && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  All Gallery Photos ({photos.length})
                </h2>
                <button
                  onClick={() => setShowAll(false)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close gallery"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Full Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
