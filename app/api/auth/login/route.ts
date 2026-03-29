import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { generateToken } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get Supabase client
    const supabase = await createClient()

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if password_hash exists
    if (!profile.password_hash) {
      return NextResponse.json(
        { error: 'Account not set up properly. Please contact administrator.' },
        { status: 401 }
      )
    }

    let isPasswordValid = false
    try {
      isPasswordValid = await bcrypt.compare(password, profile.password_hash)
    } catch (bcryptError) {
      throw bcryptError
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: profile.id,
      email: profile.email,
      role: profile.role,
    })

    // Return success with token and user data
    // Client will set cookie using js-cookie (more reliable than server Set-Cookie for localhost)
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
      },
    })
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
