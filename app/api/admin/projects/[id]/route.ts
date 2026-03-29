import { createAdminClient } from '@/lib/supabase/admin'
import { projectSchema } from '@/lib/validations/projects.schema'
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
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (projectError) throw projectError

    const [links, tags] = await Promise.all([
      supabase
        .from('project_links')
        .select('*')
        .eq('project_id', id)
        .order('sort_order'),
      supabase
        .from('project_tags')
        .select('*')
        .eq('project_id', id)
        .order('sort_order'),
    ])

    return NextResponse.json({
      ...projectData,
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
    const validated = projectSchema.parse(body)
    const { links, tags, ...projectData } = validated

    const { error: projectError } = await supabase
      .from('projects')
      .update({
        ...projectData,
        published_at:
          projectData.status === 'published'
            ? new Date().toISOString()
            : null,
      })
      .eq('id', id)

    if (projectError) throw projectError

    // Delete and recreate child records
    await Promise.all([
      supabase.from('project_links').delete().eq('project_id', id),
      supabase.from('project_tags').delete().eq('project_id', id),
    ])

    if (links.length > 0) {
      const { error } = await supabase
        .from('project_links')
        .insert(
          links.map(({ id: _id, ...rest }, i) => ({
            ...rest,
            project_id: id,
            sort_order: i,
          }))
        )
      if (error) throw error
    }

    if (tags.length > 0) {
      const { error } = await supabase
        .from('project_tags')
        .insert(
          tags.map(({ id: _id, ...rest }, i) => ({
            ...rest,
            project_id: id,
            sort_order: i,
          }))
        )
      if (error) throw error
    }

    revalidatePath('/projects')

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
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/projects')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
