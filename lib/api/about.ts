import { createClient } from '@/lib/supabase/server'
import { AboutContent } from '@/lib/validations/about.schema'

export async function getAboutContent() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('about_content')
    .select(`
      *,
      about_highlights(*),
      about_principles(*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

export async function getAboutById(id: string) {
  const supabase = await createClient()
  const { data: aboutData, error: aboutError } = await supabase
    .from('about_content')
    .select('*')
    .eq('id', id)
    .single()

  if (aboutError) throw new Error(aboutError.message)

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

  return {
    ...aboutData,
    highlights: highlights.data || [],
    principles: principles.data || [],
  }
}

export async function createAbout(data: AboutContent) {
  const supabase = await createClient()
  const { highlights, principles, ...aboutData } = data

  const { data: newAbout, error: aboutError } = await supabase
    .from('about_content')
    .insert({
      ...aboutData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      published_at: aboutData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (aboutError) throw new Error(aboutError.message)

  if (highlights.length > 0) {
    const { error } = await supabase
      .from('about_highlights')
      .insert(highlights.map((highlight, i) => ({ ...highlight, about_id: newAbout.id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  if (principles.length > 0) {
    const { error } = await supabase
      .from('about_principles')
      .insert(principles.map((principle, i) => ({ ...principle, about_id: newAbout.id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  return newAbout
}

export async function updateAbout(id: string, data: AboutContent) {
  const supabase = await createClient()
  const { highlights, principles, ...aboutData } = data

  const { error: aboutError } = await supabase
    .from('about_content')
    .update({
      ...aboutData,
      published_at: aboutData.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (aboutError) throw new Error(aboutError.message)

  // Delete and recreate child records
  await Promise.all([
    supabase.from('about_highlights').delete().eq('about_id', id),
    supabase.from('about_principles').delete().eq('about_id', id),
  ])

  if (highlights.length > 0) {
    const { error } = await supabase
      .from('about_highlights')
      .insert(highlights.map((highlight, i) => ({ ...highlight, about_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  if (principles.length > 0) {
    const { error } = await supabase
      .from('about_principles')
      .insert(principles.map((principle, i) => ({ ...principle, about_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }
}

export async function deleteAbout(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('about_content')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
