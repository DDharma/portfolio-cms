'use client'

import { useRouter, useParams } from 'next/navigation'
import { useSkillsById } from '@/hooks/use-admin-api'
import { SkillsForm } from '@/components/admin/forms/skills-form'
import { ArrowLeft } from 'lucide-react'

export default function EditSkillsPage() {
  const router = useRouter()
  const params = useParams()
  const { data, isLoading, error } = useSkillsById(params.id as string)

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white">Error</h1>
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error instanceof Error ? error.message : 'Failed to load'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div>
        <h1 className="text-3xl font-bold text-white">Edit Skill</h1>
        <p className="text-zinc-400 mt-1">Update your skill details</p>
      </div>

      <SkillsForm initialData={data || undefined} isLoading={isLoading} />
    </div>
  )
}
