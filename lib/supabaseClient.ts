import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log("[SUPABASE CLIENT INIT]", {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: "public" },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export default supabase
