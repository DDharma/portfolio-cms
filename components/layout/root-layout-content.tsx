'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

type SiteSettings = {
  siteName: string
  siteTitle: string
  siteLogo: string
  resumeUrl: string | null
  socials: { label: string; href: string }[]
}

export function RootLayoutContent({ children, siteSettings }: { children: React.ReactNode; siteSettings: SiteSettings }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <div className="relative isolate flex h-screen flex-col overflow-hidden">
      <div aria-hidden className="noise-bg" />
      {!isAdmin && <Header resumeUrl={siteSettings.resumeUrl} siteLogo={siteSettings.siteLogo} />}
      {!isAdmin && <div aria-hidden className="header-fade" />}
      <main className="flex-1 overflow-y-auto min-h-0">
        {children}
        {!isAdmin && <Footer resumeUrl={siteSettings.resumeUrl} siteName={siteSettings.siteName} siteTitle={siteSettings.siteTitle} socials={siteSettings.socials} />}
      </main>
    </div>
  )
}
