'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export function RootLayoutContent({ children, resumeUrl }: { children: React.ReactNode; resumeUrl: string | null }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <div className="relative isolate flex h-screen flex-col overflow-hidden">
      <div aria-hidden className="noise-bg" />
      {!isAdmin && <Header resumeUrl={resumeUrl} />}
      {!isAdmin && <div aria-hidden className="header-fade" />}
      <main className="flex-1 overflow-y-auto min-h-0">
        {children}
        {!isAdmin && <Footer resumeUrl={resumeUrl} />}
      </main>
    </div>
  )
}
