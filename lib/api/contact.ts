import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ContactSettings } from '@/lib/validations/contact.schema'

export async function getContactSettings(): Promise<ContactSettings | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_settings')
    .select('*')
    .limit(1)
    .single()

  if (error) return null
  return data
}

export const DEFAULT_SITE_NAME = 'Portfolio'

export type SiteSettings = {
  site_name: string
  site_title: string
  site_description: string
  site_logo: string
  resume_url: string | null
  socials: { label: string; href: string }[]
}

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_settings')
    .select('site_name, site_title, site_description, site_logo, resume_url, socials')
    .limit(1)
    .single()

  if (error) return null
  return data as SiteSettings
})
