'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Plus, Copy, Check, FileImage, FileText } from 'lucide-react'
import { ImageUploader } from '@/components/admin/media/image-uploader'
import { PdfUploader } from '@/components/admin/media/pdf-uploader'

export default function MediaPage() {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploader, setShowUploader] = useState<'image' | 'pdf' | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch('/api/admin/media', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setUploads(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch media:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedia()
  }, [])

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const handleUploadSuccess = (url: string) => {
    setShowUploader(null)
    // Refresh the list
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Media Library</h1>
          <p className="text-zinc-400 mt-1">Manage uploaded images and media files</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowUploader(showUploader === 'image' ? null : 'image')}
            variant={showUploader === 'image' ? 'default' : 'secondary'}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Image
          </Button>
          <Button
            onClick={() => setShowUploader(showUploader === 'pdf' ? null : 'pdf')}
            variant={showUploader === 'pdf' ? 'default' : 'secondary'}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload PDF
          </Button>
        </div>
      </div>

      {showUploader === 'image' && (
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upload New Image</h3>
          <ImageUploader value="" onChange={handleUploadSuccess} />
        </div>
      )}

      {showUploader === 'pdf' && (
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upload New PDF</h3>
          <PdfUploader value="" onChange={handleUploadSuccess} />
        </div>
      )}

      {/* Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-lg border border-white/6 bg-white/2 animate-pulse"
            />
          ))}
        </div>
      ) : uploads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {uploads.map((media) => (
            <div
              key={media.id}
              className="rounded-lg overflow-hidden border border-white/[0.1] bg-zinc-950 hover:border-white/[0.2] transition-all group"
            >
              {/* Preview */}
              <div className="relative h-48 bg-zinc-900 overflow-hidden">
                {media.mime_type === 'application/pdf' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <FileText className="h-16 w-16 text-blue-400 opacity-70" />
                  </div>
                ) : (
                  <Image
                    src={media.url}
                    alt={media.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="p-3 space-y-2">
                <h3 className="text-white font-semibold text-sm line-clamp-1" title={media.name}>
                  {media.name}
                </h3>

                {/* Metadata */}
                <div className="space-y-1 text-xs text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>{(media.size / 1024).toFixed(2)} KB</span>
                    <span>{media.mime_type}</span>
                  </div>
                  <div>{new Date(media.created_at).toLocaleDateString()}</div>
                </div>

                {/* Copy URL Button */}
                <button
                  onClick={() => handleCopyUrl(media.url)}
                  className="w-full px-3 py-2 rounded text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {copiedUrl === media.url ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-12 text-center">
          <FileImage className="h-12 w-12 text-zinc-400 mx-auto mb-3 opacity-50" />
          <p className="text-zinc-400">No media uploaded yet</p>
        </div>
      )}
    </div>
  )
}
