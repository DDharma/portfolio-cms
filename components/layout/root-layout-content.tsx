'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <div className="relative isolate flex h-screen flex-col overflow-hidden">
      <div aria-hidden className="noise-bg" />
      {!isAdmin && <Header />}
      {!isAdmin && <div aria-hidden className="header-fade" />}
      <main className="flex-1 overflow-y-auto min-h-0">
        {children}
        {!isAdmin && <Footer />}
      </main>
    </div>
  )
}
