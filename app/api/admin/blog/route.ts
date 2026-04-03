import { createAdminClient } from '@/lib/supabase/admin'
import { blogPostSchema } from '@/lib/validations/blog.schema'
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
      .from('blog_posts')
      .select('*, blog_post_tags (*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get blog posts error:', error)
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
    const validated = blogPostSchema.parse(body)
    const { tags, ...blogData } = validated

    const { data: newBlog, error: blogError } = await supabase
      .from('blog_posts')
      .insert({
        ...blogData,
        created_by: authResult.user.userId,
        published_at: blogData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()
    if (blogError) throw blogError

    if (tags.length > 0)
      await supabase
        .from('blog_post_tags')
        .insert(tags.map((t, i) => ({ ...t, blog_post_id: newBlog.id, sort_order: i })))

    return NextResponse.json({ success: true, data: newBlog }, { status: 201 })
  } catch (error) {
    console.error('Create blog post error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 400 }
    )
  }
}
