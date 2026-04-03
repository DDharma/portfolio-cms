import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sectionMetadataSchema } from '@/lib/validations/section-metadata.schema'
import { requireAdmin } from '@/lib/auth/jwt'

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const supabase = createAdminClient()
    const { key } = await params

    const { data, error } = await supabase
      .from('section_metadata')
      .select('*')
      .eq('section_key', key)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Section metadata not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching section metadata:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const supabase = createAdminClient()
    const { key } = await params
    const body = await request.json()

    // Validate the input
    const validatedData = sectionMetadataSchema.parse({
      ...body,
      section_key: key,
    })

    // Upsert (update if exists, insert if doesn't)
    const { data, error } = await supabase
      .from('section_metadata')
      .upsert(
        {
          section_key: key,
          heading: validatedData.heading,
          title: validatedData.title,
          description: validatedData.description,
          status: validatedData.status,
        },
        { onConflict: 'section_key' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error updating section metadata:', error)
      return NextResponse.json({ error: 'Failed to update section metadata' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH:', error)
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }
}
