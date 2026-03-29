'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CSSStyleForm } from '@/components/admin/forms/css-style-form'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewStylePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create style')
      }

      router.push('/admin/styles')
      router.refresh()
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/styles">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Custom Style</h1>
          <p className="text-sm text-zinc-400 mt-1">Add a new CSS class for your content</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl rounded-lg border border-white/[0.1] bg-zinc-950 p-6">
        <CSSStyleForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
