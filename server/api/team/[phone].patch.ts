// server/api/team/[phone].patch.ts
import { useSupabaseAdmin } from '../../utils/supabase'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const phone = String(getRouterParam(event, 'phone') || '').replace(/\D/g, '')
  if (!phone) throw createError({ statusCode: 400, statusMessage: 'رقم الجوال مطلوب' })

  const body = await readBody(event)
  const patch: any = { updated_at: new Date().toISOString() }

  if (body?.name !== undefined) patch.name = String(body.name).trim()
  if (body?.active !== undefined) patch.active = !!body.active

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase
    .from('team')
    .update(patch)
    .eq('phone', phone)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true, member: data }
})