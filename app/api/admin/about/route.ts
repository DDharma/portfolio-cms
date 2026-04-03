import { createAdminClient } from '@/lib/supabase/admin'
import { aboutContentSchema } from '@/lib/validations/about.schema'
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
      .from('about_content')
      .select(
        `
        *,
        about_highlights (*),
        about_principles (*)
      `
      )
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get about content error:', error)
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
    const validated = aboutContentSchema.parse(body)
    const { highlights, principles, ...aboutData } = validated

    const { data: newAbout, error: aboutError } = await supabase
      .from('about_content')
      .insert({
        ...aboutData,
        created_by: authResult.user.userId,
        published_at: aboutData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()
    if (aboutError) throw aboutError

    if (highlights.length > 0)
      await supabase
        .from('about_highlights')
        .insert(highlights.map((h, i) => ({ ...h, about_id: newAbout.id, sort_order: i })))
    if (principles.length > 0)
      await supabase
        .from('about_principles')
        .insert(principles.map((p, i) => ({ ...p, about_id: newAbout.id, sort_order: i })))

    return NextResponse.json({ success: true, data: newAbout }, { status: 201 })
  } catch (error) {
    console.error('Create about content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 400 }
    )
  }
}
