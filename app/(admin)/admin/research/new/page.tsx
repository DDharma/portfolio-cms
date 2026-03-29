'use client'

import { useRouter } from 'next/navigation'
import { ResearchForm } from '@/components/admin/forms/research-form'
import { ArrowLeft } from 'lucide-react'

export default function NewResearchPage() {
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
        <h1 className="text-3xl font-bold text-white">Create Research</h1>
        <p className="text-zinc-400 mt-1">Add a new research entry to your portfolio</p>
      </div>

      <ResearchForm />
    </div>
  )
}
