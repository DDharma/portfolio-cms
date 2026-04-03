'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
  header: string
  key: keyof T
  render?: (value: any, item: T) => React.ReactNode
  width?: string
  sortable?: boolean
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  sortBy?: keyof T
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: keyof T, order: 'asc' | 'desc') => void
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  sortBy,
  sortOrder = 'asc',
  onSort,
}: DataTableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (!onSort) return
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc'
    onSort(key, newOrder)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg border border-white/[0.06] bg-zinc-950 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-white/[0.06] bg-zinc-950">
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06] bg-zinc-950">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn('px-6 py-3 text-left text-xs font-semibold text-zinc-300', col.width)}
              >
                {col.sortable && onSort ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    {col.header}
                    {sortBy === col.key && (
                      <>
                        {sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-white/[0.06] transition-colors',
                onRowClick && 'cursor-pointer hover:bg-white/[0.05]'
              )}
            >
              {columns.map((col) => (
                <td
                  key={`${row.id}-${String(col.key)}`}
                  className={cn('px-6 py-4 text-sm text-zinc-300', col.width)}
                >
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
