'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useGalleryList, useDeleteGallery, useToggleGalleryFeatured } from '@/hooks/use-admin-api'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/ui/data-table'
import { StatusBadge } from '@/components/admin/ui/status-badge'
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog'
import { Plus, Edit, Trash2, Grid3x3, List, Star } from 'lucide-react'

export default function GalleryListPage() {
  const router = useRouter()
  const { data, isLoading } = useGalleryList()
  const deleteGallery = useDeleteGallery()
  const toggleFeatured = useToggleGalleryFeatured()
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteGallery.mutateAsync(id)
      setDeletingId(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete')
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gallery</h1>
          <p className="text-zinc-400 mt-1">Manage your gallery photos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-white/[0.1] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white/[0.1] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white/[0.1] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => router.push('/admin/gallery/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Photo
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded-lg border border-white/6 bg-white/2 animate-pulse" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.map((photo: any) => (
                <div
                  key={photo.id}
                  className="group rounded-lg overflow-hidden border border-white/[0.1] bg-zinc-950 hover:border-white/[0.2] transition-all"
                >
                  <div className="relative h-48 bg-zinc-900">
                    <Image
                      src={photo.image_url}
                      alt={photo.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Featured Badge - Top Left */}
                    {photo.is_featured && (
                      <div className="absolute top-2 left-2 z-10 bg-yellow-500/90 rounded-full p-1">
                        <Star className="h-3 w-3 text-white fill-white" />
                      </div>
                    )}
                    {/* Action Buttons - Top Right */}
                    <div className="absolute top-2 right-2 flex items-center gap-2 scale-0 group-hover:scale-100 transition-transform origin-top-right z-10">
                      <button
                        onClick={() => toggleFeatured.mutate({ id: photo.id, is_featured: !photo.is_featured })}
                        className={`p-2 rounded transition-colors cursor-pointer ${
                          photo.is_featured
                            ? 'bg-yellow-500 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-yellow-500 hover:text-white'
                        }`}
                        title={photo.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/gallery/${photo.id}`)}
                        className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                        title="Edit photo"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <ConfirmDialog title="Delete?" action="Delete" isDangerous onConfirm={() => handleDelete(photo.id)}>
                        <button className="p-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer" title="Delete photo">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </ConfirmDialog>
                    </div>
                    {/* Title & Status Overlay - Bottom */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="w-full space-y-2">
                        <h3 className="text-white font-semibold text-sm line-clamp-1">{photo.title}</h3>
                        <StatusBadge status={photo.status} />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm text-zinc-400">{photo.category || 'No category'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-12 text-center">
              <p className="text-zinc-400">No photos uploaded yet</p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          columns={[
            { header: 'Title', key: 'title' },
            { header: 'Category', key: 'category', render: (_, item) => item.category || '-' },
            { header: 'Featured', key: 'is_featured', render: (_, item) =>
              item.is_featured ? <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> : <span className="text-zinc-600">—</span>
            },
            { header: 'Status', key: 'status', render: (_, item) => <StatusBadge status={item.status} /> },
            { header: 'Created', key: 'created_at', render: (_, item) => new Date(item.created_at).toLocaleDateString() },
            {
              header: 'Actions',
              key: 'id',
              render: (_, item) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured.mutate({ id: item.id, is_featured: !item.is_featured })}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      item.is_featured ? 'text-yellow-400' : 'text-zinc-400 hover:text-yellow-400'
                    }`}
                    title={item.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button onClick={() => router.push(`/admin/gallery/${item.id}`)} className="text-zinc-400 hover:text-white cursor-pointer">
                    <Edit className="h-4 w-4" />
                  </button>
                  <ConfirmDialog title="Delete?" action="Delete" isDangerous onConfirm={() => handleDelete(item.id)}>
                    <button className="text-zinc-400 hover:text-red-400 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </ConfirmDialog>
                </div>
              ),
            },
          ]}
          data={data || []}
          loading={isLoading}
          emptyMessage="No photos uploaded yet"
        />
      )}
    </div>
  )
}
