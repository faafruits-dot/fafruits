import { createIcons, icons } from 'lucide'

export default defineNuxtPlugin((nuxtApp) => {
  const refresh = () => {
    nextTick(() => {
      try { createIcons({ icons }) } catch {}
    })
  }

  nuxtApp.hook('page:finish', refresh)
  nuxtApp.hook('app:mounted', refresh)

  if (process.client) {
    window.addEventListener('load', refresh)
  }
})