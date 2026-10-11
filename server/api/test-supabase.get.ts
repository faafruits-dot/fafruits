// server/api/test-supabase.get.ts
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  // 1) تأكد إن المتغيرات موجودة
  const envCheck = {
    hasUrl:        !!config.supabaseUrl,
    hasServiceKey: !!config.supabaseServiceKey,
    urlPreview:    config.supabaseUrl ? config.supabaseUrl.substring(0, 30) + '...' : null
  }

  // 2) جرّب الاتصال
  try {
    const supabase = useSupabaseAdmin()
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return {
        ok: false,
        env: envCheck,
        error: error.message,
        hint: 'تأكد إن جدول products موجود وإن RLS مفعّل صح'
      }
    }

    return {
      ok: true,
      env: envCheck,
      productsCount: count ?? 0,
      message: `✅ الاتصال ناجح — ${count} منتج في الجدول`
    }
  } catch (e: any) {
    return {
      ok: false,
      env: envCheck,
      error: e.message
    }
  }
})