export function useFavorites() {
  const favorites = useState<string[]>('favorites', () => {
    if (process.client) {
      try {
        const raw = localStorage.getItem('fa_fav')
        if (raw) return JSON.parse(raw)
      } catch {}
    }
    return []
  })

  const persist = () => {
    if (process.client) localStorage.setItem('fa_fav', JSON.stringify(favorites.value))
  }

  const toggle = (id: string) => {
    const idx = favorites.value.indexOf(id)
    if (idx > -1) favorites.value.splice(idx, 1)
    else favorites.value.push(id)
    persist()
  }

  return { favorites, toggle, persist }
}