'use client'

import { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/api/query-client'
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-zinc-950">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <main className="p-6 md:p-8">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
