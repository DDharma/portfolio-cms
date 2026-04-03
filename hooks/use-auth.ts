import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin', // Allow cookies to be set
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMessage = data.error || 'Login failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const { token, user: newUser } = data

      Cookies.set('token', token, {
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      setUser(newUser)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      // Re-throw error so login page can catch it
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
      Cookies.remove('token')
      setUser(null)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
  }
}
