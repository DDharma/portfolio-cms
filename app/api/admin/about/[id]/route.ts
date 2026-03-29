import { createAdminClient } from '@/lib/supabase/admin'
import { aboutContentSchema } from '@/lib/validations/about.schema'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/jwt'

export async function GET(
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
    const { data: aboutData, error: aboutError } = await supabase
      .from('about_content')
      .select('*')
      .eq('id', id)
      .single()

    if (aboutError) throw aboutError

    const [highlights, principles] = await Promise.all([
      supabase
        .from('about_highlights')
        .select('*')
        .eq('about_id', id)
        .order('sort_order'),
      supabase
        .from('about_principles')
        .select('*')
        .eq('about_id', id)
        .order('sort_order'),
    ])

    return NextResponse.json({
      ...aboutData,
      highlights: highlights.data || [],
      principles: principles.data || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const body = await request.json()
    const validated = aboutContentSchema.parse(body)
    const { highlights, principles, ...aboutData } = validated

    const { error: aboutError } = await supabase
      .from('about_content')
      .update({
        ...aboutData,
        published_at:
          aboutData.status === 'published'
            ? new Date().toISOString()
            : null,
      })
      .eq('id', id)

    if (aboutError) throw aboutError

    // Delete and recreate child records
    await Promise.all([
      supabase.from('about_highlights').delete().eq('about_id', id),
      supabase.from('about_principles').delete().eq('about_id', id),
    ])

    if (highlights.length > 0) {
      const { error } = await supabase
        .from('about_highlights')
        .insert(
          highlights.map((highlight, i) => ({
            ...highlight,
            about_id: id,
            sort_order: i,
          }))
        )
      if (error) throw error
    }

    if (principles.length > 0) {
      const { error } = await supabase
        .from('about_principles')
        .insert(
          principles.map((principle, i) => ({
            ...principle,
            about_id: id,
            sort_order: i,
          }))
        )
      if (error) throw error
    }

    revalidatePath('/about')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
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
    const { error } = await supabase
      .from('about_content')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/about')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
