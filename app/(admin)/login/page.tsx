'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await login(email, password)
      setLoading(false)
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to manage your portfolio</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-white/[0.06] bg-zinc-950 p-8 backdrop-blur"
        >
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 text-sm text-zinc-400">
          <Link href="/setup" className="text-zinc-400 hover:text-white hover:underline">
            First time? Set up admin account
          </Link>
          <Link href="/" className="text-white hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
