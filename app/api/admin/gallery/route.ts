import { createAdminClient } from '@/lib/supabase/admin'
import { galleryPhotoSchema } from '@/lib/validations/gallery.schema'
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
      .from('gallery_photos')
      .select(`
        *,
        gallery_tags (*)
      `)
      .order('sort_order')

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data?.map((photo) => ({
        ...photo,
        tags: photo.gallery_tags || [],
      })),
    })
  } catch (error) {
    console.error('Get gallery error:', error)
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
    const validated = galleryPhotoSchema.parse(body)
    const { tags, ...photoData } = validated

    const { data: newPhoto, error: photoError } = await supabase
      .from('gallery_photos')
      .insert({
        ...photoData,
        created_by: authResult.user.userId,
        published_at: photoData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (photoError) throw photoError

    if (tags.length > 0) {
      const { error } = await supabase
        .from('gallery_tags')
        .insert(tags.map((tag, i) => ({ ...tag, photo_id: newPhoto.id, sort_order: i })))
      if (error) throw error
    }

    return NextResponse.json({ success: true, data: newPhoto }, { status: 201 })
  } catch (error) {
    console.error('Create gallery error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 400 }
    )
  }
}
