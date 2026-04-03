import { createClient } from '@/lib/supabase/server'

export async function getPublishedGalleryPhotos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gallery_photos')
    .select(
      `
      *,
      gallery_tags(*)
    `
    )
    .eq('status', 'published')
    .order('sort_order')

  if (error) return []
  return data || []
}

export async function getGalleryPhotoById(id: string) {
  const supabase = await createClient()
  const { data: photoData, error: photoError } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (photoError) return null

  const { data: tags, error: tagsError } = await supabase
    .from('gallery_tags')
    .select('*')
    .eq('photo_id', id)
    .order('sort_order')

  return {
    ...photoData,
    tags: tags || [],
  }
}
