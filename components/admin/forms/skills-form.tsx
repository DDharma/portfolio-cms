'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SkillCategory, skillCategorySchema, PROFICIENCY_LEVELS } from '@/lib/validations/skills.schema'
import { Button } from '@/components/ui/button'
import { FormField } from './form-field'
import { IconSelector } from '@/components/admin/ui/icon-selector'
import { Plus, X } from 'lucide-react'
import { useCreateSkill, useUpdateSkill } from '@/hooks/use-admin-api'

interface SkillsFormProps {
  initialData?: SkillCategory
  isLoading?: boolean
}

export function SkillsForm({ initialData, isLoading = false }: SkillsFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const statusRef = useRef<'draft' | 'published'>(initialData?.status || 'draft')

  const createMutation = useCreateSkill()
  const updateMutation = useUpdateSkill()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<SkillCategory>({
    resolver: zodResolver(skillCategorySchema as any),
    defaultValues: initialData || {
      name: '',
      description: '',
      icon: '',
      skills: [],
      status: 'draft',
      sort_order: 0,
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
      statusRef.current = initialData.status
    }
  }, [initialData, form])

  const skillsField = useFieldArray({
    control: form.control,
    name: 'skills',
  })

  const onSubmit = async (data: SkillCategory) => {
    setError(null)

    try {
      const payload = { ...data, status: statusRef.current }

      if (initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        })
      } else {
        await createMutation.mutateAsync(payload)
      }

      router.push('/admin/skills')
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
          <h3 className="text-lg font-semibold text-white">Category Information</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Basic details about the skill category
          </p>
        </div>

        <FormField
          label="Category Name"
          required
          error={form.formState.errors.name?.message}
        >
          <input
            type="text"
            {...form.register('name')}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none"
            placeholder="e.g., Frontend, Backend, DevOps"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField
          label="Description"
          error={form.formState.errors.description?.message}
        >
          <textarea
            {...form.register('description')}
            className="w-full h-20 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none resize-none"
            placeholder="Category description (optional)"
            disabled={isSubmitting || isLoading}
          />
        </FormField>

        <FormField
          label="Icon"
          error={form.formState.errors.icon?.message}
        >
          <IconSelector
            value={form.watch('icon') || ''}
            onChange={(iconName) => form.setValue('icon', iconName)}
            disabled={isSubmitting || isLoading}
          />
        </FormField>
      </div>

      {/* Skills */}
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Skills</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => skillsField.append({ name: '', proficiency_level: 'intermediate', sort_order: 0 })}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        </div>

        <div className="space-y-3">
          {skillsField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Skill name"
                  {...form.register(`skills.${index}.name`)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div className="w-32">
                <select
                  {...form.register(`skills.${index}.proficiency_level`)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none text-sm"
                  disabled={isSubmitting}
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => skillsField.remove(index)}
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
