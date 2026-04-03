import { createAdminClient } from '@/lib/supabase/admin'
import { blogPostSchema } from '@/lib/validations/blog.schema'
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
    const { data: blogData, error: blogError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (blogError) throw blogError

    const { data: tags, error: tagsError } = await supabase
      .from('blog_post_tags')
      .select('*')
      .eq('blog_post_id', id)
      .order('sort_order')

    if (tagsError) throw tagsError

    return NextResponse.json({
      ...blogData,
      tags: tags || [],
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
    const validated = blogPostSchema.parse(body)
    const { tags, ...blogData } = validated

    const { error: blogError } = await supabase
      .from('blog_posts')
      .update({
        ...blogData,
        published_at: blogData.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (blogError) throw blogError

    // Delete and recreate tags
    await supabase.from('blog_post_tags').delete().eq('blog_post_id', id)

    if (tags.length > 0) {
      const { error } = await supabase.from('blog_post_tags').insert(
        tags.map((tag, i) => ({
          ...tag,
          blog_post_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    revalidatePath('/blog')

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
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)

    if (error) throw error

    revalidatePath('/blog')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
