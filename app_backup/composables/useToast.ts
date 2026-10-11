/* =========================================================
   useToast — إدارة التنبيهات (Toast Notifications)
   ========================================================= */

export interface ToastItem {
  id: number
  msg: string
  icon: string
}

let nextId = 1

export function useToast() {
  const toasts = useState<ToastItem[]>('toasts', () => [])

  const show = (msg: string, icon = 'check') => {
    if (!process.client) return
    const id = nextId++
    toasts.value.push({ id, msg, icon })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 2500)
  }

  const clear = () => {
    toasts.value = []
  }

  return { toasts, show, clear }
}