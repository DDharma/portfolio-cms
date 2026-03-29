'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { CSSStyleForm } from '@/components/admin/forms/css-style-form'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EditStylePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [style, setStyle] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchStyle = async () => {
      try {
        const res = await fetch(`/api/admin/styles/${id}`)
        if (!res.ok) throw new Error('Failed to fetch style')
        const data = await res.json()
        setStyle(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load style')
      }
    }

    fetchStyle()
  }, [id])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/styles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update style')
      }

      router.push('/admin/styles')
      router.refresh()
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this style?')) return

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/styles/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete style')

      router.push('/admin/styles')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete style')
      setIsDeleting(false)
    }
  }

  if (error && !style) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/styles">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!style) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/styles">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
        <div className="text-center text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/styles">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Style</h1>
            <p className="text-sm text-zinc-400 mt-1">{style.name}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="max-w-2xl rounded-lg border border-white/[0.1] bg-zinc-950 p-6">
        <CSSStyleForm initialData={style} onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
