export const KD = (n: number | string) => `${Number(n).toFixed(2)} د.ك`
export const cleanPhone = (p: string | null | undefined) => (p || '').replace(/\D/g, '')

export function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return 'الآن'
  if (m < 60) return `منذ ${m} د`
  const h = Math.floor(m / 60)
  if (h < 24) return `منذ ${h} س`
  const d = Math.floor(h / 24)
  return `منذ ${d} يوم`
}

export function formatArabicDate(iso: string): string {
  if (!iso) return 'تاريخ آخر'
  try {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('ar-KW', { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return iso }
}