'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GalleryForm } from '@/components/admin/forms/gallery-form'

export default function NewGalleryPage() {
  const router = useRouter()

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
          <h1 className="text-3xl font-bold text-white">New Photo</h1>
          <p className="text-zinc-400 mt-1">Add a new photo to the gallery</p>
        </div>
      </div>

      <GalleryForm />
    </div>
  )
}
