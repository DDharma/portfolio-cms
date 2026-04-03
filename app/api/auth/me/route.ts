import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request)

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult

  return NextResponse.json({
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
  })
}
