'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { heroContentSchema } from '@/lib/validations/hero.schema'
import { Button } from '@/components/ui/button'
import { FormField } from './form-field'
import { RichTextEditor } from './rich-text-editor'
import { ImageUploader } from '@/components/admin/media/image-uploader'
import { IconSelector } from '@/components/admin/ui/icon-selector'
import { Plus, X } from 'lucide-react'
import { useCreateHero, useUpdateHero } from '@/hooks/use-admin-api'

type HeroContent = {
  id?: string
  title: string
  subtitle: string
  description: string
  featured_image?: any
  ctas: Array<{ id?: string; label: string; href: string; variant: 'default' | 'secondary'; sort_order: number }>
  stats: Array<{ id?: string; label: string; value: string; sort_order: number }>
  marquee_items: Array<{ id?: string; text: string; icon?: string; sort_order: number }>
  custom_style_ids: string[] | null
  status: 'draft' | 'published'
  sort_order?: number
  heading?: any
}

// Helper to unescape HTML entities
const unescapeHTML = (html: string): string => {
  if (!html) return ''
  const textarea = document.createElement('textarea')
  textarea.innerHTML = html
  return textarea.value
}

interface HeroFormProps {
  initialData?: HeroContent
  isLoading?: boolean
}

export function HeroForm({ initialData, isLoading = false }: HeroFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialData?.status || 'draft'
  )

  const createMutation = useCreateHero()
  const updateMutation = useUpdateHero()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // Fetch custom styles for RichTextEditor
  const { data: customStylesData } = useQuery({
    queryKey: ['custom-styles'],
    queryFn: async () => {
      const res = await fetch('/api/admin/styles')
      if (!res.ok) throw new Error('Failed to fetch styles')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const form = useForm<HeroContent>({
    resolver: zodResolver(heroContentSchema as any),
    defaultValues: initialData || {
      title: '',
      subtitle: '',
      description: '',
      ctas: [],
      stats: [],
      marquee_items: [],
      custom_style_ids: null,
      status: 'draft',
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Unescape HTML from database before loading into editor
      const unescapedData = {
        ...initialData,
        title: initialData.title ? unescapeHTML(initialData.title) : '',
        description: initialData.description ? unescapeHTML(initialData.description) : '',
      }
      form.reset(unescapedData)
      setStatus(initialData.status)
    }
  }, [initialData, form])

  const ctasField = useFieldArray({
    control: form.control,
    name: 'ctas',
  })

  const statsField = useFieldArray({
    control: form.control,
    name: 'stats',
  })

  const marqueeField = useFieldArray({
    control: form.control,
    name: 'marquee_items',
  })

  const onSubmit = async (data: HeroContent) => {
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

      router.push('/admin/hero')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Basic Information</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Main content for the hero section
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-white">
            Title <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-zinc-400 mt-1 mb-3">
            Use rich text formatting and apply custom styles
          </p>
          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter hero title with rich formatting..."
                disabled={isSubmitting || isLoading}
                enableCustomClasses
                availableClasses={customStylesData?.data || []}
                error={form.formState.errors.title?.message}
              />
            )}
          />
        </div>

        <FormField
          label="Subtitle"
          error={form.formState.errors.subtitle?.message}
        >
          <input
            type="text"
            {...form.register('subtitle')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="Optional subtitle"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <div>
          <label className="text-sm font-medium text-white">Description</label>
          <p className="text-xs text-zinc-400 mt-1 mb-3">
            Optional: Rich text formatting supported
          </p>
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter hero description..."
                disabled={isSubmitting || isLoading}
                enableCustomClasses
                availableClasses={customStylesData?.data || []}
                error={form.formState.errors.description?.message}
              />
            )}
          />
        </div>

        <FormField label="Featured Image">
          <ImageUploader
            value={form.watch('featured_image')}
            onChange={(url) => form.setValue('featured_image', url)}
            disabled={isSubmitting || isLoading}
          />
        </FormField>
      </div>

      {/* CTAs */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Call-to-Actions</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => ctasField.append({ label: '', href: '', variant: 'default', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add CTA
          </Button>
        </div>

        <div className="space-y-4">
          {ctasField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Label"
                  {...form.register(`ctas.${index}.label`)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Link"
                  {...form.register(`ctas.${index}.href`)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="button"
                onClick={() => ctasField.remove(index)}
                className="text-zinc-500 hover:text-red-400 transition-colors h-10 w-10 flex items-center justify-center"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Statistics</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => statsField.append({ label: '', value: '', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Stat
          </Button>
        </div>

        <div className="space-y-4">
          {statsField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Label"
                  {...form.register(`stats.${index}.label`)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Value"
                  {...form.register(`stats.${index}.value`)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="button"
                onClick={() => statsField.remove(index)}
                className="text-zinc-500 hover:text-red-400 transition-colors h-10 w-10 flex items-center justify-center"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Items */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Marquee Items</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => marqueeField.append({ text: '', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {marqueeField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-zinc-400 block">Text</label>
                <input
                  type="text"
                  placeholder="Item text"
                  {...form.register(`marquee_items.${index}.text`)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-zinc-400 block">Icon</label>
                <IconSelector
                  value={form.watch(`marquee_items.${index}.icon`) || ''}
                  onChange={(iconName) =>
                    form.setValue(`marquee_items.${index}.icon`, iconName)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="button"
                onClick={() => marqueeField.remove(index)}
                className="text-zinc-500 hover:text-red-400 transition-colors h-10 w-10 flex items-center justify-center rounded-lg hover:bg-white/[0.05]"
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
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          name="status"
          onClick={() => setStatus('draft')}
          disabled={isSubmitting}
          variant="secondary"
        >
          {isSubmitting ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          type="submit"
          onClick={() => setStatus('published')}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}
