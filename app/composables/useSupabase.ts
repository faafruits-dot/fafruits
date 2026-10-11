import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null

export const useSupabase = () => {
  if (client) return client

  const config = useRuntimeConfig()

  client = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string
  )

  return client
}