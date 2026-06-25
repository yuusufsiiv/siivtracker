import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabaseUrlPresent = Boolean(supabaseUrl)
const supabaseAnonKeyPresent = Boolean(supabaseAnonKey)

console.log('Supabase URL Check:', supabaseUrlPresent)
console.log('Supabase Anon Key Check:', supabaseAnonKeyPresent)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing in environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
