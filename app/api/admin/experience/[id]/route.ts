import { createAdminClient } from '@/lib/supabase/admin'
import { experienceItemSchema } from '@/lib/validations/experience.schema'
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
    const { data: experienceData, error: expError } = await supabase
      .from('experience_items')
      .select('*')
      .eq('id', id)
      .single()

    if (expError) throw expError

    const [achievements, techStack] = await Promise.all([
      supabase
        .from('experience_achievements')
        .select('*')
        .eq('experience_id', id)
        .order('sort_order'),
      supabase
        .from('experience_tech_stack')
        .select('*')
        .eq('experience_id', id)
        .order('sort_order'),
    ])

    return NextResponse.json({
      ...experienceData,
      achievements: achievements.data || [],
      tech_stack: techStack.data || [],
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
    const validated = experienceItemSchema.parse(body)
    const { achievements, tech_stack, ...experienceData } = validated

    const { error: expError } = await supabase
      .from('experience_items')
      .update({
        ...experienceData,
        published_at: experienceData.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (expError) throw expError

    // Delete and recreate child records
    await Promise.all([
      supabase.from('experience_achievements').delete().eq('experience_id', id),
      supabase.from('experience_tech_stack').delete().eq('experience_id', id),
    ])

    if (achievements.length > 0) {
      const { error } = await supabase.from('experience_achievements').insert(
        achievements.map((achievement, i) => ({
          ...achievement,
          experience_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    if (tech_stack.length > 0) {
      const { error } = await supabase.from('experience_tech_stack').insert(
        tech_stack.map((tech, i) => ({
          ...tech,
          experience_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    revalidatePath('/experience')

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
    const { error } = await supabase.from('experience_items').delete().eq('id', id)

    if (error) throw error

    revalidatePath('/experience')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
