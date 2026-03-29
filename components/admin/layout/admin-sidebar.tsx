'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Zap,
  Users,
  Briefcase,
  BookOpen,
  Lightbulb,
  Layers,
  GraduationCap,
  Image as ImageIcon,
  Images,
  Palette,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Zap },
  { href: '/admin/hero', label: 'Hero', icon: Zap },
  { href: '/admin/about', label: 'About', icon: Users },
  { href: '/admin/skills', label: 'Skills', icon: Layers },
  { href: '/admin/experience', label: 'Experience', icon: Briefcase },
  { href: '/admin/projects', label: 'Projects', icon: Lightbulb },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/research', label: 'Research', icon: GraduationCap },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/styles', label: 'Styles', icon: Palette },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-white/[0.06] bg-zinc-950 p-6 fixed left-0 top-0 h-screen overflow-y-auto scrollbar-hide">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="text-lg font-bold text-white">Admin</span>
        </Link>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-white/[0.1] text-white'
                : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
