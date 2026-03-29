'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { AboutContent, aboutContentSchema } from '@/lib/validations/about.schema'
import { Button } from '@/components/ui/button'
import { FormField } from './form-field'
import { RichTextEditor } from './rich-text-editor'
import { ImageUploader } from '@/components/admin/media/image-uploader'
import { IconSelector } from '@/components/admin/ui/icon-selector'
import { Plus, X } from 'lucide-react'
import { useCreateAbout, useUpdateAbout } from '@/hooks/use-admin-api'

// Helper to unescape HTML entities
const unescapeHTML = (html: string): string => {
  if (!html) return ''
  const textarea = document.createElement('textarea')
  textarea.innerHTML = html
  return textarea.value
}

interface AboutFormProps {
  initialData?: AboutContent
  isLoading?: boolean
}

export function AboutForm({ initialData, isLoading = false }: AboutFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const statusRef = useRef<'draft' | 'published'>(initialData?.status || 'draft')

  const createMutation = useCreateAbout()
  const updateMutation = useUpdateAbout()
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

  const form = useForm<AboutContent>({
    resolver: zodResolver(aboutContentSchema) as any,
    defaultValues: initialData || {
      title: '',
      description: '',
      featured_image: '',
      custom_style_ids: null,
      highlights: [],
      principles: [],
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
      statusRef.current = initialData.status
    }
  }, [initialData, form])

  const highlightsField = useFieldArray({
    control: form.control,
    name: 'highlights',
  })

  const principlesField = useFieldArray({
    control: form.control,
    name: 'principles',
  })

  const onSubmit = async (data: AboutContent) => {
    setError(null)
    console.log('Form submitted with status:', statusRef.current)

    try {
      const payload = { ...data, status: statusRef.current }
      console.log('Sending payload:', payload)

      if (initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        })
      } else {
        await createMutation.mutateAsync(payload)
      }

      console.log('Success! Redirecting to about list')
      router.push('/admin/about')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.log('Form error:', errorMessage, err)
      setError(errorMessage)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
      console.log('Form validation errors:', errors)
    })} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Validation Errors */}
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-sm text-amber-400">Please fix the following errors:</p>
          <ul className="text-sm text-amber-400 mt-2 list-disc list-inside">
            {Object.entries(form.formState.errors).map(([field, error]) => (
              <li key={field}>{field}: {error?.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Basic Information</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Main content for the about section
          </p>
        </div>

        <FormField
          label="Title"
          required
          error={form.formState.errors.title?.message}
        >
          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="About section title with rich formatting"
                enableCustomClasses
                availableClasses={customStylesData?.data || []}
                disabled={isSubmitting || isLoading}
              />
            )}
          />
        </FormField>

        <FormField
          label="Description"
          required
          error={form.formState.errors.description?.message}
        >
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="About section description with rich formatting"
                enableCustomClasses
                availableClasses={customStylesData?.data || []}
                disabled={isSubmitting || isLoading}
              />
            )}
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

      {/* Highlights */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Highlights</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => highlightsField.append({ title: '', description: '', icon: '', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Highlight
          </Button>
        </div>

        <div className="space-y-4">
          {highlightsField.fields.map((field, index) => (
            <div key={field.id} className="space-y-3 p-4 rounded-lg bg-zinc-950 border border-white/[0.05]">
              <input
                type="text"
                placeholder="Highlight title"
                {...form.register(`highlights.${index}.title`)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                disabled={isSubmitting}
              />
              <textarea
                placeholder="Highlight description"
                {...form.register(`highlights.${index}.description`)}
                className="w-full h-16 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm resize-none"
                disabled={isSubmitting}
              />
              <div>
                <label className="text-xs text-zinc-400 block mb-2">Icon (optional)</label>
                <IconSelector
                  value={form.watch(`highlights.${index}.icon`) || ''}
                  onChange={(iconName) =>
                    form.setValue(`highlights.${index}.icon`, iconName)
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => highlightsField.remove(index)}
                  className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Principles */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Principles</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => principlesField.append({ title: '', description: '', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Principle
          </Button>
        </div>

        <div className="space-y-4">
          {principlesField.fields.map((field, index) => (
            <div key={field.id} className="space-y-3 p-4 rounded-lg bg-zinc-950 border border-white/[0.05]">
              <input
                type="text"
                placeholder="Principle title"
                {...form.register(`principles.${index}.title`)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                disabled={isSubmitting}
              />
              <textarea
                placeholder="Principle description"
                {...form.register(`principles.${index}.description`)}
                className="w-full h-16 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => principlesField.remove(index)}
                  className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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
          onClick={() => {
            statusRef.current = 'draft'
          }}
          disabled={isSubmitting}
          variant="secondary"
        >
          {isSubmitting ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          type="submit"
          onClick={() => {
            statusRef.current = 'published'
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}
