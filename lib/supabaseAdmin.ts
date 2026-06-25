import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    : null

export function requireSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return supabaseAdmin
}
