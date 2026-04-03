import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export type JWTPayload = {
  userId: string
  email: string
  role: 'admin' | 'user'
  iat?: number
  exp?: number
}

/**
 * Generate a JWT token with user data
 * Token expires in 24 hours
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
  })
}

/**
 * Verify and decode a JWT token
 * Returns null if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch {
    // Token is invalid or expired
    return null
  }
}

/**
 * Extract JWT token from request
 * Checks Authorization header first, then falls back to cookie
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie as fallback
  const cookieToken = request.cookies.get('token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Middleware to require authentication
 * Returns user data if authenticated, error response if not
 */
export function requireAuth(request: NextRequest) {
  const token = getTokenFromRequest(request)

  if (!token) {
    return { error: 'Unauthorized - No token provided', status: 401 as const }
  }

  const payload = verifyToken(token)

  if (!payload) {
    return { error: 'Unauthorized - Invalid or expired token', status: 401 as const }
  }

  return { user: payload }
}

/**
 * Middleware to require admin role
 * Returns user data if admin, error response if not
 */
export function requireAdmin(request: NextRequest) {
  const authResult = requireAuth(request)

  if ('error' in authResult) {
    return authResult
  }

  if (authResult.user.role !== 'admin') {
    return { error: 'Forbidden - Admin access required', status: 403 as const }
  }

  return authResult
}
