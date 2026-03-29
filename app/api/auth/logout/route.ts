import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Create response to clear token cookie
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })

  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // This deletes the cookie
  })

  return response
}
