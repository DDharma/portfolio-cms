import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase admin client using the service role key
 * This client BYPASSES Row Level Security (RLS) policies
 *
 * Use this ONLY for server-side admin operations that need to bypass RLS
 * NEVER expose the SERVICE_ROLE_KEY to the client
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
