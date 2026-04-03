'use client'

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'draft' | 'published'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        status === 'published'
          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'published' ? 'bg-green-400' : 'bg-yellow-400'
        )}
      />
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  )
}
