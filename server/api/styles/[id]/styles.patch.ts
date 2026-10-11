import { useSupabaseAdmin } from '../../../utils/supabase'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'معرّف المنتج مطلوب' })

  const body = await readBody<{ style_ids: string[] }>(event)
  if (!Array.isArray(body?.style_ids)) {
    throw createError({ statusCode: 400, statusMessage: 'style_ids مطلوب' })
  }

  const supabase = useSupabaseAdmin()

  await supabase.from('product_style_links').delete().eq('product_id', id)

  if (body.style_ids.length) {
    const rows = body.style_ids.map(style_id => ({ product_id: id, style_id }))
    const { error } = await supabase.from('product_style_links').insert(rows)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})