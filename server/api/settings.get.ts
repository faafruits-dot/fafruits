import { useSupabaseAdmin } from '../utils/supabase'

export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('settings')
    .select('key, value, updated_at')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const settings: Record<string, string> = {}
  data?.forEach(s => { settings[s.key] = s.value ?? '' })

  return { ok: true, settings }
})