import { createAdminClient } from '@/lib/supabase/admin'
import { skillCategorySchema } from '@/lib/validations/skills.schema'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/jwt'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { id } = await params
  const supabase = createAdminClient()

  try {
    const { data: skillData, error: skillError } = await supabase
      .from('skill_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (skillError) throw skillError

    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .eq('category_id', id)
      .order('sort_order')

    if (skillsError) throw skillsError

    return NextResponse.json({
      ...skillData,
      skills: skills || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { id } = await params
  const supabase = createAdminClient()

  try {
    const body = await request.json()
    const validated = skillCategorySchema.parse(body)
    const { skills, ...categoryData } = validated

    const { error: categoryError } = await supabase
      .from('skill_categories')
      .update({
        ...categoryData,
        published_at: categoryData.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (categoryError) throw categoryError

    // Delete and recreate skills
    await supabase.from('skills').delete().eq('category_id', id)

    if (skills.length > 0) {
      const { error } = await supabase.from('skills').insert(
        skills.map((skill, i) => ({
          ...skill,
          category_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    revalidatePath('/skills')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { id } = await params
  const supabase = createAdminClient()

  try {
    const { error } = await supabase.from('skill_categories').delete().eq('id', id)

    if (error) throw error

    revalidatePath('/skills')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
