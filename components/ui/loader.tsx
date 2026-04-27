import { cn } from '@/lib/utils'

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-24', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
    </div>
  )
}

export function AdminLoader() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-72 animate-pulse rounded bg-white/[0.04]" />
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 flex-1 animate-pulse rounded bg-white/[0.04]" />
              <div className="h-4 w-20 animate-pulse rounded bg-white/[0.04]" />
              <div className="h-4 w-16 animate-pulse rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
