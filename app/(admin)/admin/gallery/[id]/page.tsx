'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GalleryForm } from '@/components/admin/forms/gallery-form'
import { useGalleryById } from '@/hooks/use-admin-api'

export default function EditGalleryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: photo, isLoading } = useGalleryById(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Photo</h1>
          <p className="text-zinc-400 mt-1">Update gallery photo details</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-400">Loading...</p>
        </div>
      ) : photo ? (
        <GalleryForm initialData={photo} />
      ) : (
        <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-8 text-center">
          <p className="text-zinc-400">Photo not found</p>
        </div>
      )}
    </div>
  )
}
