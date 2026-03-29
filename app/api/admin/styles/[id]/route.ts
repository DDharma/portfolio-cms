import { createAdminClient } from '@/lib/supabase/admin'
import { updateCustomStyleSchema } from '@/lib/validations/custom-styles.schema'
import { sanitizeCSS, isValidClassName } from '@/lib/utils/css-sanitizer'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/jwt'

/**
 * GET /api/admin/styles/[id]
 * Get a single custom style
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('custom_styles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch style' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/styles/[id]
 * Update a custom style (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validated = updateCustomStyleSchema.parse(body)

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

    // Validate class name if changed
    if (validated.name && !isValidClassName(validated.name)) {
      return NextResponse.json(
        {
          error: 'Invalid class name. Use lowercase letters, numbers, and hyphens only.',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check for name uniqueness (excluding current style)
    if (validated.name) {
      const { data: existing } = await supabase
        .from('custom_styles')
        .select('id')
        .eq('name', validated.name)
        .neq('id', id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: 'A style with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Update style
    const { data, error } = await supabase
      .from('custom_styles')
      .update({
        name: validated.name,
        css_rules: sanitized,
        description: validated.description || null,
        category: validated.category,
        is_active: validated.is_active,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Update style error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update style' },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/admin/styles/[id]
 * Delete a custom style (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Soft delete: set is_active to false
    // Change to hard delete if preferred:
    // await supabase.from('custom_styles').delete().eq('id', id)

    const { error } = await supabase
      .from('custom_styles')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete style error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete style' },
      { status: 500 }
    )
  }
}
