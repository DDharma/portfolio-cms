import { createAdminClient } from '@/lib/supabase/admin'
import { heroContentSchema } from '@/lib/validations/hero.schema'
import { sanitizeHTML } from '@/lib/utils/html-sanitizer'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/jwt'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { id } = await params
  const supabase = createAdminClient()

  try {
    const { data: heroData, error: heroError } = await supabase
      .from('hero_content')
      .select('*')
      .eq('id', id)
      .single()

    if (heroError) throw heroError

    const [ctas, stats, marquee] = await Promise.all([
      supabase.from('hero_ctas').select('*').eq('hero_id', id).order('sort_order'),
      supabase.from('hero_stats').select('*').eq('hero_id', id).order('sort_order'),
      supabase.from('hero_marquee_items').select('*').eq('hero_id', id).order('sort_order'),
    ])

    return NextResponse.json({
      ...heroData,
      ctas: ctas.data || [],
      stats: stats.data || [],
      marquee_items: marquee.data || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { id } = await params
  const supabase = createAdminClient()

  try {
    const body = await request.json()
    console.log('PATCH body:', JSON.stringify(body, null, 2))
    const validated = heroContentSchema.parse(body)
    console.log('Validated data:', validated)

    // Sanitize HTML content
    if (validated.title) {
      validated.title = sanitizeHTML(validated.title)
    }
    if (validated.description) {
      validated.description = sanitizeHTML(validated.description)
    }

    const { ctas, stats, marquee_items, ...heroData } = validated

    const { error: heroError } = await supabase
      .from('hero_content')
      .update({
        ...heroData,
        published_at: heroData.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (heroError) throw heroError

    // Delete and recreate child records
    await Promise.all([
      supabase.from('hero_ctas').delete().eq('hero_id', id),
      supabase.from('hero_stats').delete().eq('hero_id', id),
      supabase.from('hero_marquee_items').delete().eq('hero_id', id),
    ])

    if (ctas.length > 0) {
      const { error } = await supabase.from('hero_ctas').insert(
        ctas.map((cta, i) => ({
          id: cta.id || uuidv4(),
          label: cta.label,
          href: cta.href,
          variant: cta.variant,
          hero_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    if (stats.length > 0) {
      const { error } = await supabase.from('hero_stats').insert(
        stats.map((stat, i) => ({
          id: stat.id || uuidv4(),
          label: stat.label,
          value: stat.value,
          hero_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    if (marquee_items.length > 0) {
      const { error } = await supabase.from('hero_marquee_items').insert(
        marquee_items.map((item, i) => ({
          id: item.id || uuidv4(),
          text: item.text,
          icon: item.icon,
          hero_id: id,
          sort_order: i,
        }))
      )
      if (error) throw error
    }

    // Revalidate home page if published
    if (validated.status === 'published') {
      revalidatePath('/')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update'
    console.error('Error message:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { id } = await params
  const supabase = createAdminClient()

  try {
    const { error } = await supabase.from('hero_content').delete().eq('id', id)

    if (error) throw error

    // Revalidate home page
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
