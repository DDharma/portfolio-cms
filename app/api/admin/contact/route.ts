import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contactSettingsSchema } from '@/lib/validations/contact.schema'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('contact_settings')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Contact settings not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching contact settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Validate the input
    const validatedData = contactSettingsSchema.parse(body)

    // Get existing record to update or create new one
    const { data: existing } = await supabase
      .from('contact_settings')
      .select('id')
      .limit(1)
      .single()

    const result = existing
      ? // Update existing
        await supabase
          .from('contact_settings')
          .update({
            site_name: validatedData.site_name,
            site_title: validatedData.site_title,
            site_description: validatedData.site_description,
            site_logo: validatedData.site_logo,
            email: validatedData.email,
            location: validatedData.location,
            availability: validatedData.availability,
            resume_url: validatedData.resume_url || null,
            socials: validatedData.socials,
            callouts: validatedData.callouts,
          })
          .eq('id', existing.id)
          .select()
          .single()
      : // Insert new
        await supabase
          .from('contact_settings')
          .insert({
            site_name: validatedData.site_name,
            site_title: validatedData.site_title,
            site_description: validatedData.site_description,
            site_logo: validatedData.site_logo,
            email: validatedData.email,
            location: validatedData.location,
            availability: validatedData.availability,
            resume_url: validatedData.resume_url || null,
            socials: validatedData.socials,
            callouts: validatedData.callouts,
          })
          .select()
          .single()

    const { data, error } = result

    if (error) {
      console.error('Error updating contact settings:', error)
      return NextResponse.json(
        { error: 'Failed to update contact settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH:', error)
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}
