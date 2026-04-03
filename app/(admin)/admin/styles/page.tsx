'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, RotateCw } from 'lucide-react'

interface CustomStyle {
  id: string
  name: string
  css_rules: string
  description?: string
  category?: string
  is_active: boolean
}

export default function StylesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const {
    data: styles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['custom-styles'],
    queryFn: async () => {
      const res = await fetch('/api/admin/styles')
      if (!res.ok) throw new Error('Failed to fetch styles')
      const json = await res.json()
      return json.data || []
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 2,
  })

  const filteredStyles = selectedCategory
    ? styles.filter((s: CustomStyle) => s.category === selectedCategory)
    : styles

  const categories = ['text', 'background', 'border', 'layout', 'custom']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Custom Styles</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage CSS classes for your content</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/admin/styles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Style
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-white/[0.1] text-white'
              : 'border border-white/[0.1] text-zinc-400 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              selectedCategory === cat
                ? 'bg-white/[0.1] text-white'
                : 'border border-white/[0.1] text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Styles Table */}
      <div className="rounded-lg border border-white/[0.1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.1] bg-zinc-950">
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Preview</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">
                    Loading styles...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-red-400 mb-2">
                      Error loading styles:{' '}
                      {error instanceof Error ? error.message : 'Unknown error'}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => refetch()}
                      className="gap-2"
                    >
                      <RotateCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </td>
                </tr>
              ) : filteredStyles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">
                    No styles found. Create your first style!
                  </td>
                </tr>
              ) : (
                filteredStyles.map((style: CustomStyle) => (
                  <tr key={style.id} className="border-b border-white/[0.05] hover:bg-zinc-950">
                    <td className="px-6 py-4 text-sm font-medium text-white">{style.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400 capitalize">
                      {style.category || 'custom'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div
                        className="w-24 h-8 rounded border border-white/[0.1]"
                        style={{ all: 'unset' }}
                      >
                        <div
                          className="w-full h-full rounded"
                          style={{
                            ...Object.fromEntries(
                              style.css_rules.split(';').map((rule) => {
                                const [key, value] = rule.split(':').map((s) => s.trim())
                                return [key.replace(/-./g, (x) => x[1].toUpperCase()), value]
                              })
                            ),
                          }}
                        >
                          <span className="text-xs text-white">Sample</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          style.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-500/20 text-zinc-400'
                        }`}
                      >
                        {style.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/styles/${style.id}`}>
                        <Button variant="secondary" size="sm" className="inline-flex">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
