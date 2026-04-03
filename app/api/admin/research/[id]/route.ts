import { createAdminClient } from '@/lib/supabase/admin'
import { researchPaperSchema } from '@/lib/validations/research.schema'
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
    const { data: researchData, error: researchError } = await supabase
      .from('research_papers')
      .select('*')
      .eq('id', id)
      .single()

    if (researchError) throw researchError

    const [links, tags] = await Promise.all([
      supabase
        .from('research_paper_links')
        .select('*')
        .eq('research_paper_id', id)
        .order('sort_order'),
      supabase
        .from('research_paper_tags')
        .select('*')
        .eq('research_paper_id', id)
        .order('sort_order'),
    ])

    return NextResponse.json({
      ...researchData,
      links: links.data || [],
      tags: tags.data || [],
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
    const validated = researchPaperSchema.parse(body)
    const { links, tags, ...researchData } = validated

    const { error: researchError } = await supabase
      .from('research_papers')
      .update({
        ...researchData,
        published_at: researchData.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (researchError) throw researchError

    // Delete and recreate child records
    await Promise.all([
      supabase.from('research_paper_links').delete().eq('research_paper_id', id),
      supabase.from('research_paper_tags').delete().eq('research_paper_id', id),
    ])

    if (links.length > 0) {
      const { error } = await supabase.from('research_paper_links').insert(
        links.map((link, i) => ({
          ...link,
          research_paper_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    if (tags.length > 0) {
      const { error } = await supabase.from('research_paper_tags').insert(
        tags.map((tag, i) => ({
          ...tag,
          research_paper_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    revalidatePath('/research')

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
    const { error } = await supabase.from('research_papers').delete().eq('id', id)

    if (error) throw error

    revalidatePath('/research')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
