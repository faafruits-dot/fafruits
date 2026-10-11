// server/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const useSupabaseAdmin = () => {
  const config = useRuntimeConfig()

  // ⭐ استخدم runtimeConfig مش process.env
  const url = config.public.supabaseUrl as string
  const key = config.supabaseServiceKey as string

  if (!url) {
    throw new Error('❌ SUPABASE_URL غير موجود في runtimeConfig')
  }
  if (!key) {
    throw new Error('❌ SUPABASE_SERVICE_KEY غير موجود في runtimeConfig')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}