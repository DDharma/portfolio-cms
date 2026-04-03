'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { experienceItemSchema } from '@/lib/validations/experience.schema'
import { Button } from '@/components/ui/button'
import { FormField } from './form-field'
import { ImageUploader } from '@/components/admin/media/image-uploader'
import { Plus, X } from 'lucide-react'
import { useCreateExperience, useUpdateExperience } from '@/hooks/use-admin-api'

type ExperienceItem = {
  id?: string
  title: string
  company: string
  location: string
  start_date: string
  end_date?: string | null
  is_current: boolean
  description: string
  featured_image?: string | null
  achievements: Array<{ id?: string; achievement: string; sort_order: number }>
  tech_stack: Array<{ id?: string; technology: string; sort_order: number }>
  status: 'draft' | 'published'
  sort_order: number
}

interface ExperienceFormProps {
  initialData?: ExperienceItem
  isLoading?: boolean
}

export function ExperienceForm({ initialData, isLoading = false }: ExperienceFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft')

  const createMutation = useCreateExperience()
  const updateMutation = useUpdateExperience()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<ExperienceItem>({
    resolver: zodResolver(experienceItemSchema as any),
    defaultValues: {
      title: initialData?.title || '',
      company: initialData?.company || '',
      location: initialData?.location || '',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      is_current: initialData?.is_current ?? false,
      description: initialData?.description || '',
      featured_image: initialData?.featured_image || '',
      achievements: initialData?.achievements || [],
      tech_stack: initialData?.tech_stack || [],
      status: initialData?.status || 'draft',
      sort_order: initialData?.sort_order ?? 0,
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
      setStatus(initialData.status)
    }
  }, [initialData, form])

  const achievementsField = useFieldArray({
    control: form.control,
    name: 'achievements',
  })

  const techStackField = useFieldArray({
    control: form.control,
    name: 'tech_stack',
  })

  const onSubmit = async (data: ExperienceItem) => {
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

      router.push('/admin/experience')
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
          <h3 className="text-lg font-semibold text-white">Experience Details</h3>
          <p className="text-sm text-zinc-400 mt-1">Information about the work experience</p>
        </div>

        <FormField label="Job Title" required error={form.formState.errors.title?.message}>
          <input
            type="text"
            {...form.register('title')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="e.g., Senior Developer"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField label="Company" required error={form.formState.errors.company?.message}>
          <input
            type="text"
            {...form.register('company')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="Company name"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField label="Location" required error={form.formState.errors.location?.message}>
          <input
            type="text"
            {...form.register('location')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="City, Country"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" required error={form.formState.errors.start_date?.message}>
            <input
              type="date"
              {...form.register('start_date')}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white focus:border-white/[0.2] focus:outline-none"
              disabled={isSubmitting || isLoading}
            />
          </FormField>

          <FormField label="End Date" error={form.formState.errors.end_date?.message}>
            <div className="space-y-2">
              <input
                type="date"
                {...form.register('end_date')}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white focus:border-white/[0.2] focus:outline-none disabled:opacity-50"
                disabled={form.watch('is_current') || isSubmitting || isLoading}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register('is_current')}
                  className="rounded"
                  disabled={isSubmitting || isLoading}
                />
                <span className="text-sm text-zinc-400">Currently working here</span>
              </label>
            </div>
          </FormField>
        </div>

        <FormField label="Description" required error={form.formState.errors.description?.message}>
          <textarea
            {...form.register('description')}
            className="w-full h-24 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none resize-none"
            placeholder="Job description"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField label="Featured Image">
          <ImageUploader
            value={form.watch('featured_image') || ''}
            onChange={(url) => form.setValue('featured_image', url)}
            disabled={isSubmitting || isLoading}
          />
        </FormField>
      </div>

      {/* Achievements */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => achievementsField.append({ achievement: '', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Achievement
          </Button>
        </div>

        <div className="space-y-2">
          {achievementsField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <input
                type="text"
                placeholder="Achievement"
                {...form.register(`achievements.${index}.achievement`)}
                className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => achievementsField.remove(index)}
                className="text-zinc-500 hover:text-red-400 transition-colors h-10 w-10 flex items-center justify-center cursor-pointer"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Technologies Used</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => techStackField.append({ technology: '', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Technology
          </Button>
        </div>

        <div className="space-y-2">
          {techStackField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <input
                type="text"
                placeholder="Technology name"
                {...form.register(`tech_stack.${index}.technology`)}
                className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => techStackField.remove(index)}
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
