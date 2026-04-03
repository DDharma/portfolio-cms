'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useExperienceList,
  useDeleteExperience,
  useSectionMetadata,
  useUpdateSectionMetadata,
} from '@/hooks/use-admin-api'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/ui/data-table'
import { StatusBadge } from '@/components/admin/ui/status-badge'
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog'
import { Plus, Edit, Trash2, X } from 'lucide-react'

export default function ExperienceListPage() {
  const router = useRouter()
  const { data, isLoading } = useExperienceList()
  const deleteExperience = useDeleteExperience()
  const { data: sectionHeading, isLoading: isLoadingSectionHeading } =
    useSectionMetadata('experience')
  const updateSectionHeading = useUpdateSectionMetadata()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isEditingHeading, setIsEditingHeading] = useState(false)
  const [editingHeadingValues, setEditingHeadingValues] = useState({
    heading: sectionHeading?.heading || '',
    title: sectionHeading?.title || '',
    description: sectionHeading?.description || '',
  })

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteExperience.mutateAsync(id)
      setDeletingId(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete')
      setDeletingId(null)
    }
  }

  const handleSaveHeading = async () => {
    try {
      await updateSectionHeading.mutateAsync({
        key: 'experience',
        data: editingHeadingValues,
      })
      setIsEditingHeading(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update section heading')
    }
  }

  const handleCancelHeading = () => {
    setEditingHeadingValues({
      heading: sectionHeading?.heading || '',
      title: sectionHeading?.title || '',
      description: sectionHeading?.description || '',
    })
    setIsEditingHeading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Experience</h1>
          <p className="text-zinc-400 mt-1">Manage your work experience</p>
        </div>
        <Button onClick={() => router.push('/admin/experience/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {/* Section Heading Card */}
      {!isLoadingSectionHeading && sectionHeading && (
        <div className="rounded-lg border border-white/6 bg-zinc-950 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditingHeading ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white">Heading (Eyebrow)</label>
                    <input
                      type="text"
                      value={editingHeadingValues.heading}
                      onChange={(e) =>
                        setEditingHeadingValues({
                          ...editingHeadingValues,
                          heading: e.target.value,
                        })
                      }
                      className="w-full mt-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none text-sm"
                      placeholder="e.g. Experience"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Title</label>
                    <input
                      type="text"
                      value={editingHeadingValues.title}
                      onChange={(e) =>
                        setEditingHeadingValues({ ...editingHeadingValues, title: e.target.value })
                      }
                      className="w-full mt-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none text-sm"
                      placeholder="Main heading..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Description</label>
                    <textarea
                      value={editingHeadingValues.description}
                      onChange={(e) =>
                        setEditingHeadingValues({
                          ...editingHeadingValues,
                          description: e.target.value,
                        })
                      }
                      className="w-full mt-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none text-sm"
                      placeholder="Optional description..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={handleCancelHeading}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveHeading}
                      disabled={updateSectionHeading.isPending}
                    >
                      {updateSectionHeading.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-indigo-400 mb-1">
                    {sectionHeading.heading}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{sectionHeading.title}</h3>
                  {sectionHeading.description && (
                    <p className="text-sm text-zinc-400">{sectionHeading.description}</p>
                  )}
                </div>
              )}
            </div>
            {!isEditingHeading && (
              <button
                onClick={() => {
                  setEditingHeadingValues({
                    heading: sectionHeading.heading || '',
                    title: sectionHeading.title || '',
                    description: sectionHeading.description || '',
                  })
                  setIsEditingHeading(true)
                }}
                className="ml-4 text-zinc-400 hover:text-white cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <DataTable
        columns={[
          { header: 'Title', key: 'title' },
          { header: 'Company', key: 'company' },
          {
            header: 'Status',
            key: 'status',
            render: (_, item) => <StatusBadge status={item.status} />,
          },
          {
            header: 'Created',
            key: 'created_at',
            render: (_, item) => new Date(item.created_at).toLocaleDateString(),
          },
          {
            header: 'Actions',
            key: 'id',
            render: (_, item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/admin/experience/${item.id}`)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <ConfirmDialog
                  title="Delete?"
                  action="Delete"
                  isDangerous
                  onConfirm={() => handleDelete(item.id)}
                >
                  <button className="text-zinc-400 hover:text-red-400 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </ConfirmDialog>
              </div>
            ),
          },
        ]}
        data={data || []}
        loading={isLoading}
        emptyMessage="No experience added yet"
      />
    </div>
  )
}
