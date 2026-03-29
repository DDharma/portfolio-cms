'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAboutList, useDeleteAbout } from '@/hooks/use-admin-api'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/ui/data-table'
import { StatusBadge } from '@/components/admin/ui/status-badge'
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { sanitizeHTML } from '@/lib/utils/html-sanitizer'

// Helper to unescape HTML entities (convert &lt; to <, etc.)
const unescapeHTML = (html: string): string => {
  if (!html) return ''
  const textarea = document.createElement('textarea')
  textarea.innerHTML = html
  return textarea.value
}

export default function AboutListPage() {
  const router = useRouter()
  const { data, isLoading } = useAboutList()
  const deleteAbout = useDeleteAbout()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteAbout.mutateAsync(id)
      setDeletingId(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete')
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">About Section</h1>
          <p className="text-zinc-400 mt-1">Manage your about section content</p>
        </div>
        <Button onClick={() => router.push('/admin/about/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New About
        </Button>
      </div>

      <DataTable
        columns={[
          {
            header: 'Title',
            key: 'title',
            render: (_, item) => {
              const unescaped = unescapeHTML(item.title || '');
              const sanitized = sanitizeHTML(unescaped);
              return <div className="text-sm line-clamp-2" dangerouslySetInnerHTML={{ __html: sanitized }} />;
            },
          },
          { header: 'Status', key: 'status', render: (_, item) => <StatusBadge status={item.status} /> },
          { header: 'Created', key: 'created_at', render: (_, item) => new Date(item.created_at).toLocaleDateString() },
          {
            header: 'Actions',
            key: 'id',
            render: (_, item) => (
              <div className="flex items-center gap-2">
                <button onClick={() => router.push(`/admin/about/${item.id}`)} className="text-zinc-400 hover:text-white cursor-pointer">
                  <Edit className="h-4 w-4" />
                </button>
                <ConfirmDialog title="Delete?" action="Delete" isDangerous onConfirm={() => handleDelete(item.id)}>
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
        emptyMessage="No about content created yet"
      />
    </div>
  )
}
