'use client'

import { useState, useRef } from 'react'
import { FileText, X } from 'lucide-react'
import Cookies from 'js-cookie'
import { cn } from '@/lib/utils'

interface PdfUploaderProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
}

export function PdfUploader({
  value,
  onChange,
  disabled,
  className,
}: PdfUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extract filename from URL
  const getFilename = (url: string) => {
    const urlObj = new URL(url, 'https://example.com')
    const pathname = urlObj.pathname
    return pathname.split('/').pop() || 'document.pdf'
  }

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
        <div className="rounded-lg border border-white/[0.1] bg-zinc-950 p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate font-medium">
                {getFilename(value)}
              </p>
              <p className="text-xs text-zinc-500 truncate">{value}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled || isUploading}
              className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30 transition-colors flex-shrink-0"
              title="Remove PDF"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
          <FileText className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
          <p className="text-sm text-zinc-400">
            {isUploading ? 'Uploading...' : 'Click to upload PDF'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">PDF up to 25MB</p>
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}
