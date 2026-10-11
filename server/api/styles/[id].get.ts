import { useSupabaseAdmin } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'معرّف مطلوب' })

  const supabase = useSupabaseAdmin()

  const { data: style } = await supabase
    .from('product_styles')
    .select('*')
    .eq('id', id)
    .single()

  if (!style) throw createError({ statusCode: 404, statusMessage: 'التصنيف غير موجود' })

  const { data: links } = await supabase
    .from('product_style_links')
    .select('product_id')
    .eq('style_id', id)

  const productIds = (links || []).map(l => l.product_id)

  if (!productIds.length) return { ok: true, style, products: [] }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('available', true)
    .order('id')

  return { ok: true, style, products: products || [] }
})