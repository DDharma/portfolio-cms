'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import Cookies from 'js-cookie'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUploader({
  value,
  onChange,
  disabled,
  className,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const headers: HeadersInit = {}
      // Get token from cookie
      const token = Cookies.get('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
        headers,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const { url } = await response.json()
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/[0.1]">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled || isUploading}
            className="absolute right-2 top-2 rounded-lg bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            'relative w-full rounded-lg border-2 border-dashed border-white/[0.1] p-6 text-center transition-colors',
            'hover:border-white/[0.2] hover:bg-zinc-950',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Upload className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
          <p className="text-sm text-zinc-400">
            {isUploading ? 'Uploading...' : 'Click to upload image'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">PNG, JPG, GIF up to 10MB</p>
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}
