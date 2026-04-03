import { createClient } from '@/lib/supabase/server'
import type { SectionMetadata } from '@/lib/validations/section-metadata.schema'

export async function getSectionMetadata(key: string): Promise<SectionMetadata | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('section_metadata')
      .select('*')
      .eq('section_key', key)
      .eq('status', 'published')
      .single()

    if (error) {
      console.warn(`Section metadata for key "${key}" not found`)
      return null
    }

    return data as SectionMetadata
  } catch (error) {
    console.error(`Error fetching section metadata for key "${key}":`, error)
    return null
  }
}
