'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBlogList, useDeleteBlog } from '@/hooks/use-admin-api'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/ui/data-table'
import { StatusBadge } from '@/components/admin/ui/status-badge'
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function BlogListPage() {
  const router = useRouter()
  const { data, isLoading } = useBlogList()
  const deleteBlog = useDeleteBlog()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteBlog.mutateAsync(id)
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
          <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
          <p className="text-zinc-400 mt-1">Manage your blog content</p>
        </div>
        <Button onClick={() => router.push('/admin/blog/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      <DataTable
        columns={[
          { header: 'Title', key: 'title' },
          { header: 'Slug', key: 'slug' },
          { header: 'Status', key: 'status', render: (_, item) => <StatusBadge status={item.status} /> },
          { header: 'Created', key: 'created_at', render: (_, item) => new Date(item.created_at).toLocaleDateString() },
          {
            header: 'Actions',
            key: 'id',
            render: (_, item) => (
              <div className="flex items-center gap-2">
                <button onClick={() => router.push(`/admin/blog/${item.id}`)} className="text-zinc-400 hover:text-white cursor-pointer">
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
        emptyMessage="No blog posts created yet"
      />
    </div>
  )
}
