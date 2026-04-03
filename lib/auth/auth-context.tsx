'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

export type User = {
  userId: string
  email: string
  name: string
  role: 'admin' | 'user'
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for stored token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check cookie first, then localStorage
        const storedToken = Cookies.get('token') || localStorage.getItem('token')
        if (storedToken) {
          await verifyToken(storedToken)
        }
      } catch (err) {
        localStorage.removeItem('token')
        Cookies.remove('token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  async function verifyToken(token: string) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'same-origin',
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setToken(token)
        setError(null)
      } else {
        localStorage.removeItem('token')
        setUser(null)
        setToken(null)
      }
    } catch (err) {
      localStorage.removeItem('token')
      setUser(null)
      setToken(null)
    }
  }

  async function login(email: string, password: string) {
    try {
      setError(null)
      setIsLoading(true)

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await res.json()
      const { token: newToken, user: newUser } = data

      setToken(newToken)
      setUser(newUser)

      // Save to both localStorage and cookies
      localStorage.setItem('token', newToken)
      Cookies.set('token', newToken, {
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    try {
      setIsLoading(true)
      // Call logout endpoint to clear cookies on server
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {
        // Ignore errors - logout anyway
      })
    } finally {
      setUser(null)
      setToken(null)
      setError(null)
      localStorage.removeItem('token')
      Cookies.remove('token')
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
