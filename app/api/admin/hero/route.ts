import { createAdminClient } from '@/lib/supabase/admin'
import { heroContentSchema } from '@/lib/validations/hero.schema'
import { sanitizeHTML } from '@/lib/utils/html-sanitizer'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('hero_content')
      .select(
        `
        *,
        hero_ctas (*),
        hero_stats (*),
        hero_marquee_items (*)
      `
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get hero content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const supabase = createAdminClient()

  try {
    const body = await request.json()
    const validated = heroContentSchema.parse(body)

    // Sanitize HTML content
    if (validated.title) {
      validated.title = sanitizeHTML(validated.title)
    }
    if (validated.description) {
      validated.description = sanitizeHTML(validated.description)
    }

    const { ctas, stats, marquee_items, ...heroData } = validated

    const { data: newHero, error: heroError } = await supabase
      .from('hero_content')
      .insert({
        ...heroData,
        created_by: authResult.user.userId,
        published_at: heroData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (heroError) throw heroError

    // Insert child records
    if (ctas.length > 0) {
      const { error } = await supabase.from('hero_ctas').insert(
        ctas.map((cta, i) => ({
          ...cta,
          hero_id: newHero.id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    if (stats.length > 0) {
      const { error } = await supabase.from('hero_stats').insert(
        stats.map((stat, i) => ({
          ...stat,
          hero_id: newHero.id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    if (marquee_items.length > 0) {
      const { error } = await supabase.from('hero_marquee_items').insert(
        marquee_items.map((item, i) => ({
          ...item,
          hero_id: newHero.id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    return NextResponse.json({ success: true, data: newHero }, { status: 201 })
  } catch (error) {
    console.error('Create hero content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create' },
      { status: 400 }
    )
  }
}
