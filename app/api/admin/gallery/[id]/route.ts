import { createAdminClient } from '@/lib/supabase/admin'
import { galleryPhotoSchema } from '@/lib/validations/gallery.schema'
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
    const { data: photoData, error: photoError } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('id', id)
      .single()

    if (photoError) throw photoError

    const { data: tags, error: tagsError } = await supabase
      .from('gallery_tags')
      .select('*')
      .eq('photo_id', id)
      .order('sort_order')

    if (tagsError) throw tagsError

    return NextResponse.json({
      ...photoData,
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
    const validated = galleryPhotoSchema.parse(body)
    const { tags, ...photoData } = validated

    const { error: photoError } = await supabase
      .from('gallery_photos')
      .update({
        ...photoData,
        published_at: photoData.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (photoError) throw photoError

    // Delete and recreate tags
    await supabase.from('gallery_tags').delete().eq('photo_id', id)

    if (tags.length > 0) {
      const { error } = await supabase.from('gallery_tags').insert(
        tags.map((tag, i) => ({
          ...tag,
          photo_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    revalidatePath('/gallery')

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
    const { error } = await supabase.from('gallery_photos').delete().eq('id', id)

    if (error) throw error

    revalidatePath('/gallery')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
