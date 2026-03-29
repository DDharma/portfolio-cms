import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateToken } from '@/lib/auth/jwt'

// Check if any admin account exists
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    return NextResponse.json({
      adminExists: !!(admins && admins.length > 0),
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create the first admin account (disabled after one admin exists)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Only allow registration if no admin users exist
    const { data: existingAdmins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Admin account already exists. Registration disabled.' },
        { status: 403 }
      )
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create new admin user
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        email: email.toLowerCase(),
        full_name: name || 'Admin',
        role: 'admin',
        password_hash: passwordHash,
      })
      .select('id, email, full_name, role')
      .single()

    if (createError || !newProfile) {
      console.error('Create admin error:', createError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Generate JWT token for auto-login
    const token = generateToken({
      userId: newProfile.id,
      email: newProfile.email,
      role: newProfile.role as 'admin',
    })

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.full_name,
        role: newProfile.role,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
