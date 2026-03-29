'use client'

import { useRouter } from 'next/navigation'
import { ExperienceForm } from '@/components/admin/forms/experience-form'
import { ArrowLeft } from 'lucide-react'

export default function NewExperiencePage() {
  const router = useRouter()

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
        <h1 className="text-3xl font-bold text-white">Create Experience</h1>
        <p className="text-zinc-400 mt-1">Add a new experience entry to your portfolio</p>
      </div>

      <ExperienceForm />
    </div>
  )
}
