import { createAdminClient } from '@/lib/supabase/admin'
import { projectSchema } from '@/lib/validations/projects.schema'
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
      .from('projects')
      .select('*, project_links (*), project_tags (*)')
      .order('sort_order')
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
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
    const validated = projectSchema.parse(body)
    const { links, tags, ...projectData } = validated

    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        created_by: authResult.user.userId,
        published_at: projectData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (projectError) throw projectError

    if (links.length > 0) {
      const { error } = await supabase
        .from('project_links')
        .insert(links.map((link, i) => ({ ...link, project_id: newProject.id, sort_order: i })))
      if (error) throw error
    }

    if (tags.length > 0) {
      const { error } = await supabase
        .from('project_tags')
        .insert(tags.map((tag, i) => ({ ...tag, project_id: newProject.id, sort_order: i })))
      if (error) throw error
    }

    return NextResponse.json({ success: true, data: newProject }, { status: 201 })
  } catch (error) {
    console.error('Create projects error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create' },
      { status: 400 }
    )
  }
}
