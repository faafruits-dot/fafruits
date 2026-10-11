import { useSupabaseAdmin } from '../utils/supabase'
import { requireAdmin } from '../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'بيانات غير صالحة' })
  }

  const ALLOWED = ['chef_whatsapp', 'driver_whatsapp', 'store_whatsapp']
  const supabase = useSupabaseAdmin()

  const updates = Object.entries(body)
    .filter(([k]) => ALLOWED.includes(k))
    .map(([key, value]) => ({
      key,
      value: String(value || '').replace(/\D/g, ''),
      updated_at: new Date().toISOString()
    }))

  if (!updates.length) {
    throw createError({ statusCode: 400, statusMessage: 'مافيش حقول صالحة للتحديث' })
  }

  const { error } = await supabase
    .from('settings')
    .upsert(updates, { onConflict: 'key' })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true }
})