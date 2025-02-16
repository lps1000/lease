import { createClient as supabaseCreateClient } from '@supabase/supabase-js'
import type { Database } from '@/app/types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Maak een functie die een nieuwe Supabase client instantie creëert
export function createClient() {
  return supabaseCreateClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
    },
    db: {
      schema: 'public'
    }
  })
}

// Exporteer een singleton instantie voor direct gebruik
export const supabase = supabaseCreateClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
  },
  db: {
    schema: 'public'
  }
})

export default supabase
