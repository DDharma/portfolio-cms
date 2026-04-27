import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={currentPage === 2 ? basePath : `${basePath}?page=${currentPage - 1}`}
          className="rounded-lg border border-white/[0.06] px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-white/[0.12] hover:text-white"
        >
          Previous
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={page === 1 ? basePath : `${basePath}?page=${page}`}
          className={cn(
            'rounded-lg px-4 py-2 text-sm transition-colors',
            page === currentPage
              ? 'bg-white/[0.06] text-white'
              : 'text-zinc-500 hover:text-white'
          )}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="rounded-lg border border-white/[0.06] px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-white/[0.12] hover:text-white"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
