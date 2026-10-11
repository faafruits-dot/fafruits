/* =========================================================
   useInfiniteRail — كاروسيل لا نهائي (Infinite Loop)
   - 3 نسخ: [copy1][real][copy2]
   - يبدأ من بداية "real"
   - يقفز تلقائياً عند الحدود (silently)
   ========================================================= */

import type { Ref } from 'vue'

export function useInfiniteRail(
  railRef: Ref<HTMLElement | null>,
  itemCount: number | Ref<number>,
  options: { gap?: number; stepCards?: number } = {}
) {
  const gap = options.gap ?? 16
  const stepCards = options.stepCards ?? 2

  let isRecentering = false
  let initTimer: ReturnType<typeof setTimeout> | null = null

  const count = () =>
    typeof itemCount === 'number' ? itemCount : itemCount.value

  const isRTL = () =>
    document.documentElement.dir === 'rtl' ||
    document.body.dir === 'rtl'

  const getCardWidth = () => {
    const rail = railRef.value
    if (!rail) return 0
    const card = rail.querySelector('.fr-card') as HTMLElement | null
    return card ? card.offsetWidth + gap : 0
  }

  const getSetWidth = () => getCardWidth() * count()

  /* ⭐ موضع "منظّم" — يعمل مع LTR و RTL */
  const getPos = (el: HTMLElement) =>
    isRTL() ? -el.scrollLeft : el.scrollLeft

  const setPos = (el: HTMLElement, pos: number) => {
    el.scrollLeft = isRTL() ? -pos : pos
  }

  /* ⭐ الانتقال لمنتصف الـ 3 نسخ (بداية الـ real set) */
  const initPosition = () => {
    const rail = railRef.value
    if (!rail) return
    const setW = getSetWidth()
    if (!setW) return
    setPos(rail, setW)
  }

  /* ⭐ القفز الذكي عند الحدود */
  const normalize = () => {
    if (isRecentering) return
    const rail = railRef.value
    if (!rail) return

    const setW = getSetWidth()
    if (!setW) return

    const pos = getPos(rail)

    if (pos < setW * 0.5) {
      /* في copy1 → اقفز للأمام */
      isRecentering = true
      setPos(rail, pos + setW)
      requestAnimationFrame(() => {
        isRecentering = false
      })
    } else if (pos > setW * 1.5) {
      /* في copy2 → اقفز للخلف */
      isRecentering = true
      setPos(rail, pos - setW)
      requestAnimationFrame(() => {
        isRecentering = false
      })
    }
  }

  /* ⭐ سحب يدوي (من الأزرار) */
  const scrollRail = (dir: 'prev' | 'next') => {
    const rail = railRef.value
    if (!rail) return

    const cardW = getCardWidth()
    if (!cardW) return

    const step = cardW * stepCards
    const forward = dir === 'next'
    const delta = forward ? step : -step
    const scrollDelta = isRTL() ? -delta : delta

    rail.scrollBy({ left: scrollDelta, behavior: 'smooth' })
  }

  onMounted(() => {
    nextTick(() => {
      /* ننتظر حتى الـ DOM يتم render */
      initTimer = setTimeout(() => {
        initPosition()

        const rail = railRef.value
        if (!rail) return

        rail.addEventListener('scroll', normalize, { passive: true })
        window.addEventListener('resize', initPosition)
      }, 150)
    })
  })

  onBeforeUnmount(() => {
    if (initTimer) clearTimeout(initTimer)
    const rail = railRef.value
    if (rail) rail.removeEventListener('scroll', normalize)
    window.removeEventListener('resize', initPosition)
  })

  return { scrollRail, initPosition, normalize }
}