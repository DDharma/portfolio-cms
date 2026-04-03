'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { galleryPhotoSchema } from '@/lib/validations/gallery.schema'
import { Button } from '@/components/ui/button'
import { FormField } from './form-field'
import { ImageUploader } from '@/components/admin/media/image-uploader'
import { Plus, X, Star } from 'lucide-react'
import { useCreateGallery, useUpdateGallery } from '@/hooks/use-admin-api'

type GalleryPhoto = {
  id?: string
  title: string
  image_url: string
  description?: string | null
  category?: string | null
  location?: string | null
  photo_date?: string | null
  tags: Array<{ id?: string; tag: string; sort_order: number }>
  status: 'draft' | 'published'
  sort_order: number
  is_featured: boolean
}

interface GalleryFormProps {
  initialData?: GalleryPhoto
  isLoading?: boolean
}

export function GalleryForm({ initialData, isLoading = false }: GalleryFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft')

  const createMutation = useCreateGallery()
  const updateMutation = useUpdateGallery()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<GalleryPhoto>({
    resolver: zodResolver(galleryPhotoSchema as any),
    defaultValues: initialData || {
      title: '',
      image_url: '',
      description: '',
      category: '',
      location: '',
      photo_date: '',
      tags: [],
      status: 'draft',
      sort_order: 0,
      is_featured: false,
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
      setStatus(initialData.status)
    }
  }, [initialData, form])

  const tagsField = useFieldArray({
    control: form.control,
    name: 'tags',
  })

  const onSubmit = async (data: GalleryPhoto) => {
    setError(undefined)

    try {
      const payload = { ...data, status }

      if (initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        })
      } else {
        await createMutation.mutateAsync(payload)
      }

      router.push('/admin/gallery')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Gallery Photo Details</h3>
          <p className="text-sm text-zinc-400 mt-1">Information about the gallery photo</p>
        </div>

        <FormField label="Title" required error={form.formState.errors.title?.message}>
          <input
            type="text"
            {...form.register('title')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="Photo title"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField label="Image" required error={form.formState.errors.image_url?.message}>
          <ImageUploader
            value={form.watch('image_url')}
            onChange={(url) => form.setValue('image_url', url)}
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField label="Description" error={form.formState.errors.description?.message}>
          <textarea
            {...form.register('description')}
            className="w-full h-24 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none resize-none"
            placeholder="Describe the photo (optional)"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        {/* Featured Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <Star className="h-5 w-5 text-yellow-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Feature on homepage</p>
            <p className="text-xs text-zinc-500">
              Featured photos appear in the public gallery section
            </p>
          </div>
          <button
            type="button"
            onClick={() => form.setValue('is_featured', !form.watch('is_featured'))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.watch('is_featured') ? 'bg-yellow-500' : 'bg-zinc-700'
            }`}
            disabled={isSubmitting || isLoading}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                form.watch('is_featured') ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField label="Category" error={form.formState.errors.category?.message}>
            <input
              type="text"
              {...form.register('category')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
              placeholder="e.g., Travel, Events, Nature (optional)"
              disabled={isSubmitting || isLoading}
            />
          </FormField>

          <FormField label="Location" error={form.formState.errors.location?.message}>
            <input
              type="text"
              {...form.register('location')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
              placeholder="Where was this taken? (optional)"
              disabled={isSubmitting || isLoading}
            />
          </FormField>
        </div>

        <FormField label="Photo Date" error={form.formState.errors.photo_date?.message}>
          <input
            type="date"
            {...form.register('photo_date')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            disabled={isSubmitting || isLoading}
          />
        </FormField>
      </div>

      {/* Tags */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Tags</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => tagsField.append({ tag: '', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Tag
          </Button>
        </div>

        <div className="space-y-2">
          {tagsField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <input
                type="text"
                placeholder="Tag"
                {...form.register(`tags.${index}.tag`)}
                className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => tagsField.remove(index)}
                className="text-zinc-500 hover:text-red-400 transition-colors h-10 w-10 flex items-center justify-center cursor-pointer"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={() => setStatus('draft')}
          disabled={isSubmitting}
          variant="secondary"
        >
          {isSubmitting ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button type="submit" onClick={() => setStatus('published')} disabled={isSubmitting}>
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}
