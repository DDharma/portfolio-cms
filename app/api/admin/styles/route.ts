import { createAdminClient } from '@/lib/supabase/admin'
import { createCustomStyleSchema } from '@/lib/validations/custom-styles.schema'
import { sanitizeCSS, isValidClassName, sanitizeClassName } from '@/lib/utils/css-sanitizer'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/jwt'

/**
 * GET /api/admin/styles
 * List all custom styles (public: active styles only, admin: all styles)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Check if user is admin (optional - allow public to see active styles)
    const authResult = requireAdmin(request)
    const isAdmin = !('error' in authResult)

    let query = supabase.from('custom_styles').select('*')

    // If not admin, only show active styles
    if (!isAdmin) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('Get styles error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch styles' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/styles
 * Create a new custom style (admin only)
 */
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()

    // Validate input
    const validated = createCustomStyleSchema.parse(body)

    // Sanitize and validate CSS
    const { valid, sanitized, errors: cssErrors } = sanitizeCSS(validated.css_rules)

    if (!valid) {
      return NextResponse.json(
        {
          error: 'Invalid CSS rules',
          details: cssErrors,
        },
        { status: 400 }
      )
    }

    // Validate and sanitize class name
    if (!isValidClassName(validated.name)) {
      return NextResponse.json(
        {
          error: 'Invalid class name. Use lowercase letters, numbers, and hyphens only.',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check for name uniqueness
    const { data: existing } = await supabase
      .from('custom_styles')
      .select('id')
      .eq('name', validated.name)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'A style with this name already exists' }, { status: 409 })
    }

    // Insert new style
    const { data, error } = await supabase
      .from('custom_styles')
      .insert({
        name: validated.name,
        css_rules: sanitized,
        description: validated.description || null,
        category: validated.category,
        created_by: authResult.user.userId,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Create style error:', error)

    // Handle Zod validation errors
    if (error instanceof Error && error.message.includes('Zod')) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create style' },
      { status: 400 }
    )
  }
}
