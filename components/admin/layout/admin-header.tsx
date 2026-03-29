'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="border-b border-white/[0.06] bg-zinc-950 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-zinc-400">Logged in as</p>
          <p className="text-white font-medium">{user?.email}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </header>
  )
}
