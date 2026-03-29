import { createClient } from '@/lib/supabase/server'
import { HeroContent } from '@/lib/validations/hero.schema'

export async function getHeroContent() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hero_content')
    .select(`
      *,
      hero_ctas(*, sort_order),
      hero_stats(*, sort_order),
      hero_marquee_items(*, sort_order)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

export async function getHeroById(id: string) {
  const supabase = await createClient()
  const { data: heroData, error: heroError } = await supabase
    .from('hero_content')
    .select('*')
    .eq('id', id)
    .single()

  if (heroError) throw new Error(heroError.message)

  const [ctas, stats, marquee] = await Promise.all([
    supabase
      .from('hero_ctas')
      .select('*')
      .eq('hero_id', id)
      .order('sort_order'),
    supabase
      .from('hero_stats')
      .select('*')
      .eq('hero_id', id)
      .order('sort_order'),
    supabase
      .from('hero_marquee_items')
      .select('*')
      .eq('hero_id', id)
      .order('sort_order'),
  ])

  return {
    ...heroData,
    ctas: ctas.data || [],
    stats: stats.data || [],
    marquee_items: marquee.data || [],
  }
}

export async function createHero(data: HeroContent) {
  const supabase = await createClient()
  const { ctas, stats, marquee_items, ...heroData } = data

  const { data: newHero, error: heroError } = await supabase
    .from('hero_content')
    .insert({
      ...heroData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      published_at: heroData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (heroError) throw new Error(heroError.message)

  if (ctas.length > 0) {
    const { error } = await supabase
      .from('hero_ctas')
      .insert(ctas.map((cta, i) => ({ ...cta, hero_id: newHero.id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  if (stats.length > 0) {
    const { error } = await supabase
      .from('hero_stats')
      .insert(stats.map((stat, i) => ({ ...stat, hero_id: newHero.id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  if (marquee_items.length > 0) {
    const { error } = await supabase
      .from('hero_marquee_items')
      .insert(marquee_items.map((item, i) => ({ ...item, hero_id: newHero.id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  return newHero
}

export async function updateHero(id: string, data: HeroContent) {
  const supabase = await createClient()
  const { ctas, stats, marquee_items, ...heroData } = data

  const { error: heroError } = await supabase
    .from('hero_content')
    .update({
      ...heroData,
      published_at: heroData.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (heroError) throw new Error(heroError.message)

  // Delete and recreate child records
  await Promise.all([
    supabase.from('hero_ctas').delete().eq('hero_id', id),
    supabase.from('hero_stats').delete().eq('hero_id', id),
    supabase.from('hero_marquee_items').delete().eq('hero_id', id),
  ])

  if (ctas.length > 0) {
    const { error } = await supabase
      .from('hero_ctas')
      .insert(ctas.map((cta, i) => ({ ...cta, hero_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  if (stats.length > 0) {
    const { error } = await supabase
      .from('hero_stats')
      .insert(stats.map((stat, i) => ({ ...stat, hero_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  if (marquee_items.length > 0) {
    const { error } = await supabase
      .from('hero_marquee_items')
      .insert(marquee_items.map((item, i) => ({ ...item, hero_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }
}

export async function deleteHero(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hero_content')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
