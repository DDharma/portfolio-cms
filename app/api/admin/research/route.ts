import { createAdminClient } from '@/lib/supabase/admin'
import { researchPaperSchema } from '@/lib/validations/research.schema'
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
      .from('research_papers')
      .select('*, research_paper_tags (*), research_paper_links (*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get research papers error:', error)
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
    const validated = researchPaperSchema.parse(body)
    const { tags, links, ...researchData } = validated

    const { data: newResearch, error: researchError } = await supabase
      .from('research_papers')
      .insert({
        ...researchData,
        created_by: authResult.user.userId,
        published_at: researchData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()
    if (researchError) throw researchError

    if (tags.length > 0)
      await supabase
        .from('research_paper_tags')
        .insert(tags.map((t, i) => ({ ...t, research_paper_id: newResearch.id, sort_order: i })))
    if (links.length > 0)
      await supabase
        .from('research_paper_links')
        .insert(links.map((l, i) => ({ ...l, research_paper_id: newResearch.id, sort_order: i })))

    return NextResponse.json({ success: true, data: newResearch }, { status: 201 })
  } catch (error) {
    console.error('Create research paper error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 400 }
    )
  }
}
