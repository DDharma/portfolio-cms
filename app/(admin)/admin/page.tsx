'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'

export default function AdminPage() {
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    experience: 0,
    research: 0,
    gallery: 0,
  })
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        const [projectsRes, blogsRes, experienceRes, researchRes, galleryRes, photoRes] =
          await Promise.all([
            supabase.from('projects').select('id', { count: 'exact' }),
            supabase.from('blog_posts').select('id', { count: 'exact' }),
            supabase.from('experience_items').select('id', { count: 'exact' }),
            supabase.from('research_papers').select('id', { count: 'exact' }),
            supabase.from('gallery_photos').select('id', { count: 'exact' }),
            supabase
              .from('gallery_photos')
              .select('id, title, image_url')
              .limit(6)
              .order('created_at', { ascending: false }),
          ])

        setStats({
          projects: projectsRes.count || 0,
          blogs: blogsRes.count || 0,
          experience: experienceRes.count || 0,
          research: researchRes.count || 0,
          gallery: galleryRes.count || 0,
        })
        setGalleryPhotos(photoRes.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-zinc-400">Welcome to your portfolio admin panel</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-lg border border-white/6 bg-white/2 animate-pulse"
              />
            ))}
          </>
        ) : (
          <>
            <Card className="p-6">
              <p className="text-sm text-zinc-400">Projects</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.projects}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-zinc-400">Blog Posts</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.blogs}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-zinc-400">Experience</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.experience}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-zinc-400">Research</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.research}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-zinc-400">Gallery Photos</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.gallery}</p>
            </Card>
          </>
        )}
      </div>

      {/* Gallery Preview */}
      {galleryPhotos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recent Gallery Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {galleryPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-lg overflow-hidden border border-white/[0.1] hover:border-white/[0.2] transition-all"
              >
                <div className="relative h-48 bg-zinc-900">
                  <Image
                    src={photo.image_url}
                    alt={photo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium text-center px-2 line-clamp-2">
                    {photo.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="p-8">
        <h2 className="text-xl font-semibold text-white">Getting Started</h2>
        <p className="mt-2 text-zinc-400">
          Navigate using the sidebar to manage your portfolio content. Start by adding projects,
          blog posts, and experience items.
        </p>
      </Card>
    </div>
  )
}
