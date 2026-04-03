'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Cookies from 'js-cookie'

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [siteName, setSiteName] = useState('')
  const [siteTitle, setSiteTitle] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  const [siteLogo, setSiteLogo] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/auth/register')
        const data = await res.json()
        if (data.adminExists) {
          router.replace('/login')
        } else {
          setChecking(false)
        }
      } catch {
        setChecking(false)
      }
    }
    checkAdmin()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, siteName, siteTitle, siteDescription, siteLogo, resumeUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Set token cookie for auto-login
      Cookies.set('token', data.token, { expires: 1, path: '/' })
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
        <p className="text-zinc-400">Checking setup status...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create your admin account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-white/[0.06] bg-zinc-950 p-8 backdrop-blur">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="Your Name"
              disabled={loading}
            />
          </div>

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
              placeholder="admin@example.com"
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
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="Repeat your password"
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <div className="border-t border-white/[0.06] pt-6 mt-2">
            <p className="text-sm font-medium text-white mb-4">Site Branding</p>
          </div>

          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-white">
              Site Name
            </label>
            <input
              id="siteName"
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="Jane Doe"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium text-white">
              Site Title
            </label>
            <input
              id="siteTitle"
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="Full-Stack Developer"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium text-white">
              Site Description
            </label>
            <textarea
              id="siteDescription"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="SEO meta description for your portfolio"
              rows={2}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="siteLogo" className="block text-sm font-medium text-white">
              Site Logo
            </label>
            <input
              id="siteLogo"
              type="text"
              value={siteLogo}
              onChange={(e) => setSiteLogo(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="J"
              maxLength={10}
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-zinc-500">Initials or short text shown in the header</p>
          </div>

          <div>
            <label htmlFor="resumeUrl" className="block text-sm font-medium text-white">
              Resume URL <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <input
              id="resumeUrl"
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-zinc-500 transition-colors hover:border-white/[0.15] focus:border-white/[0.2] focus:outline-none"
              placeholder="https://drive.google.com/file/d/..."
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating account...' : 'Create Admin Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-zinc-400">
          <Link href="/login" className="text-white hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
