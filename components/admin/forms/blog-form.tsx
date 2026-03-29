'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { BlogPost, blogPostSchema } from '@/lib/validations/blog.schema'
import { Button } from '@/components/ui/button'
import { FormField } from './form-field'
import { RichTextEditor } from './rich-text-editor'
import { ImageUploader } from '@/components/admin/media/image-uploader'
import { Plus, X } from 'lucide-react'
import { useCreateBlog, useUpdateBlog } from '@/hooks/use-admin-api'

// Helper to unescape HTML entities
const unescapeHTML = (html: string): string => {
  if (!html) return ''
  const textarea = document.createElement('textarea')
  textarea.innerHTML = html
  return textarea.value
}

interface BlogFormProps {
  initialData?: BlogPost
  isLoading?: boolean
}

export function BlogForm({ initialData, isLoading = false }: BlogFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialData?.status || 'draft'
  )
  const slugAutoRef = useRef(!initialData?.id) // true for new posts, false for existing

  const createMutation = useCreateBlog()
  const updateMutation = useUpdateBlog()
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

  const form = useForm<BlogPost>({
    resolver: zodResolver(blogPostSchema) as any,
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      content: '',
      featured_image: '',
      reading_time: '',
      tags: [],
      status: 'draft',
      sort_order: 0,
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Unescape HTML from database before loading into editor
      const unescapedData = {
        ...initialData,
        description: initialData.description ? unescapeHTML(initialData.description) : '',
        content: initialData.content ? unescapeHTML(initialData.content) : '',
      }
      form.reset(unescapedData)
      setStatus(initialData.status)
      slugAutoRef.current = false // don't auto-generate slug for existing posts
    }
  }, [initialData, form])

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && slugAutoRef.current) {
        const generated = (value.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        form.setValue('slug', generated, { shouldValidate: false })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const tagsField = useFieldArray({
    control: form.control,
    name: 'tags',
  })

  const onSubmit = async (data: BlogPost) => {
    setError(null)

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

      router.push('/admin/blog')
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
          <h3 className="text-lg font-semibold text-white">Blog Post Details</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Information about the blog post
          </p>
        </div>

        <FormField
          label="Title"
          required
          error={form.formState.errors.title?.message}
        >
          <input
            type="text"
            {...form.register('title')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="Blog post title"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField
          label="Slug"
          required
          error={form.formState.errors.slug?.message}
        >
          <input
            type="text"
            {...form.register('slug', {
              onChange: () => {
                slugAutoRef.current = false // mark as manually edited
              }
            })}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="blog-post-title (lowercase with hyphens)"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <div>
          <label className="text-sm font-medium text-white">
            Description <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-zinc-400 mt-1 mb-3">
            Use rich text formatting and apply custom styles
          </p>
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Short description for the blog post"
                disabled={isSubmitting || isLoading}
                enableCustomClasses
                availableClasses={customStylesData?.data || []}
                error={form.formState.errors.description?.message}
                maxLength={2000}
              />
            )}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white">
            Content <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-zinc-400 mt-1 mb-3">
            Full blog post content with rich formatting support
          </p>
          <Controller
            name="content"
            control={form.control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Full blog post content"
                disabled={isSubmitting || isLoading}
                enableCustomClasses
                availableClasses={customStylesData?.data || []}
                error={form.formState.errors.content?.message}
                maxLength={50000}
                enableImageUpload
              />
            )}
          />
        </div>

        <FormField label="Featured Image">
          <ImageUploader
            value={form.watch('featured_image') || ''}
            onChange={(url) => form.setValue('featured_image', url)}
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField
          label="Reading Time"
          error={form.formState.errors.reading_time?.message}
        >
          <input
            type="text"
            {...form.register('reading_time')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="e.g., 5 min read (optional)"
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
