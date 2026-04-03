'use client'

import { useRouter, useParams } from 'next/navigation'
import { useProjectsById } from '@/hooks/use-admin-api'
import { ProjectsForm } from '@/components/admin/forms/projects-form'
import { ArrowLeft } from 'lucide-react'

export default function EditProjectsPage() {
  const router = useRouter()
  const params = useParams()
  const { data, isLoading, error } = useProjectsById(params.id as string)

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
          <p className="text-sm text-red-400">
            {error instanceof Error ? error.message : 'Failed to load'}
          </p>
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
        <h1 className="text-3xl font-bold text-white">Edit Project</h1>
        <p className="text-zinc-400 mt-1">Update your project details</p>
      </div>

      <ProjectsForm initialData={data || undefined} isLoading={isLoading} />
    </div>
  )
}
