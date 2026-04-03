import { createAdminClient } from '@/lib/supabase/admin'
import { skillCategorySchema } from '@/lib/validations/skills.schema'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('skill_categories')
      .select('*, skills (*)')
      .order('sort_order')
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get skills error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const supabase = createAdminClient()

  try {
    const body = await request.json()
    const validated = skillCategorySchema.parse(body)
    const { skills, ...categoryData } = validated

    const { data: newCategory, error: categoryError } = await supabase
      .from('skill_categories')
      .insert({
        ...categoryData,
        created_by: authResult.user.userId,
        published_at: categoryData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()
    if (categoryError) throw categoryError

    if (skills.length > 0)
      await supabase
        .from('skills')
        .insert(skills.map((s, i) => ({ ...s, category_id: newCategory.id, sort_order: i })))

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 })
  } catch (error) {
    console.error('Create skills error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 400 }
    )
  }
}
