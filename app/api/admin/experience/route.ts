import { createAdminClient } from '@/lib/supabase/admin'
import { experienceItemSchema } from '@/lib/validations/experience.schema'
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
      .from('experience_items')
      .select('*, experience_achievements (*), experience_tech_stack (*)')
      .order('sort_order')
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get experience error:', error)
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
    const validated = experienceItemSchema.parse(body)
    const { achievements, tech_stack, ...expData } = validated

    const { data: newExp, error: expError } = await supabase
      .from('experience_items')
      .insert({
        ...expData,
        created_by: authResult.user.userId,
        published_at: expData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()
    if (expError) throw expError

    if (achievements.length > 0)
      await supabase
        .from('experience_achievements')
        .insert(achievements.map((a, i) => ({ ...a, experience_id: newExp.id, sort_order: i })))
    if (tech_stack.length > 0)
      await supabase
        .from('experience_tech_stack')
        .insert(tech_stack.map((t, i) => ({ ...t, experience_id: newExp.id, sort_order: i })))

    return NextResponse.json({ success: true, data: newExp }, { status: 201 })
  } catch (error) {
    console.error('Create experience error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 400 }
    )
  }
}
