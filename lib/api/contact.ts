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
