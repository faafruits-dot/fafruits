import { useSupabase } from './useSupabase'

export interface Extra {
  id: string
  name: string
  description: string | null
  icon: string
  price: number
  has_input: boolean
  input_max_length: number
  input_placeholder: string | null
  active: boolean
  sort_order: number
}

export const useExtras = () => {
  const extras = useState<Extra[]>('extras', () => [])
  const loaded = useState<boolean>('extras-loaded', () => false)

  const load = async (force = false) => {
    if (loaded.value && !force) return
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('extras')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('❌ extras load error:', error)
      return
    }
    extras.value = (data || []) as Extra[]
    loaded.value = true
  }

  if (import.meta.client && !loaded.value) load()

  return { extras, loaded, load }
}