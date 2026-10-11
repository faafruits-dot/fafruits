// server/utils/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export const useSupabaseAdmin = (): SupabaseClient => {
  if (client) return client

  const config = useRuntimeConfig()

  if (!config.supabaseUrl) {
    throw new Error('❌ SUPABASE_URL غير موجود في .env')
  }
  if (!config.supabaseServiceKey) {
    throw new Error('❌ SUPABASE_SERVICE_KEY غير موجود في .env')
  }

  client = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: { persistSession: false, autoRefreshToken: false }
    }
  )

  return client
}