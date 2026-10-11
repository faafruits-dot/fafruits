// composables/useSettings.ts
export interface Settings {
  chef_whatsapp: string
  driver_whatsapp: string
  store_whatsapp: string
}

export const useSettings = () => {
  const settings = useState<Settings>('app-settings', () => ({
    chef_whatsapp: '',
    driver_whatsapp: '',
    store_whatsapp: ''
  }))
  const loaded = useState<boolean>('app-settings-loaded', () => false)

  const load = async (force = false) => {
    if (loaded.value && !force) return
    const res = await $fetch<{ ok: boolean; settings: Settings }>('/api/settings')
    settings.value = res.settings
    loaded.value = true
  }

  const update = async (patch: Partial<Settings>) => {
    await $fetch('/api/settings', { method: 'PATCH', body: patch })
    await load(true)
  }

  return { settings, loaded, load, update }
}