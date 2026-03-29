'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FormField } from './form-field'

type CSSStyleInput = {
  name: string
  css_rules: string
  description?: string
  category: 'text' | 'background' | 'border' | 'layout' | 'custom'
  is_active: boolean
}

const cssStyleSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  css_rules: z.string().min(1, 'CSS rules are required'),
  description: z.string().optional(),
  category: z.enum(['text', 'background', 'border', 'layout', 'custom']),
  is_active: z.boolean().default(true),
}) as any

interface CSSStyleFormProps {
  initialData?: Partial<CSSStyleInput> & { id?: string }
  onSubmit: (data: CSSStyleInput) => Promise<void>
  isLoading?: boolean
}

export function CSSStyleForm({ initialData, onSubmit, isLoading = false }: CSSStyleFormProps) {
  const [error, setError] = useState<string | undefined>(undefined)
  const [cssError, setCssError] = useState<string | undefined>(undefined)

  const form = useForm<CSSStyleInput>({
    resolver: zodResolver(cssStyleSchema),
    defaultValues: {
      name: initialData?.name || '',
      css_rules: initialData?.css_rules || '',
      description: initialData?.description || '',
      category: initialData?.category || 'text',
      is_active: initialData?.is_active ?? true,
    } as CSSStyleInput,
  })

  const handleSubmit = async (data: CSSStyleInput) => {
    setError(undefined)
    setCssError(undefined)

    try {
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Name */}
      <FormField label="Style Name" error={form.formState.errors.name?.message}>
        <input
          type="text"
          placeholder="e.g., gradient-text"
          {...form.register('name')}
          className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
          disabled={isLoading}
        />
      </FormField>

      {/* Category */}
      <FormField label="Category" error={form.formState.errors.category?.message}>
        <select
          {...form.register('category')}
          className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white focus:border-white/[0.2] focus:outline-none"
          disabled={isLoading}
        >
          <option value="text">Text</option>
          <option value="background">Background</option>
          <option value="border">Border</option>
          <option value="layout">Layout</option>
          <option value="custom">Custom</option>
        </select>
      </FormField>

      {/* CSS Rules */}
      <FormField label="CSS Rules" error={form.formState.errors.css_rules?.message || cssError}>
        <textarea
          placeholder="e.g., background: linear-gradient(135deg, #7338da, #a78bfa); -webkit-background-clip: text; color: transparent;"
          {...form.register('css_rules')}
          rows={6}
          className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none font-mono text-sm"
          disabled={isLoading}
        />
      </FormField>

      {/* Description */}
      <FormField label="Description (optional)">
        <textarea
          placeholder="Describe what this style does..."
          {...form.register('description')}
          rows={3}
          className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
          disabled={isLoading}
        />
      </FormField>

      {/* Preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Preview</label>
        <div className="rounded-lg border border-white/[0.1] bg-white/[0.05] p-6">
          <div
            className="text-white font-medium"
            style={
              form.watch('css_rules')
                ? Object.fromEntries(
                    form
                      .watch('css_rules')
                      .split(';')
                      .filter(Boolean)
                      .map((rule) => {
                        const [key, value] = rule.split(':').map((s) => s.trim())
                        return [
                          key.replace(/-./g, (x) => x[1].toUpperCase()),
                          value,
                        ]
                      })
                  )
                : {}
            }
          >
            Sample Text
          </div>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          {...form.register('is_active')}
          className="w-4 h-4 rounded border-white/[0.2]"
          disabled={isLoading}
        />
        <label className="text-sm text-white">Active (available for use)</label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Style'}
        </Button>
      </div>
    </form>
  )
}
