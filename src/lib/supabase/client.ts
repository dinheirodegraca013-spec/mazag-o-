import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Validador de URL para evitar crashes de inicialização no navegador.
 */
const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Client-side Supabase Client.
 * Inicialização resiliente para o navegador utilizando variáveis de ambiente.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
    // Retorna um objeto proxy silencioso para evitar erros de "Invalid supabaseUrl" durante o build ou antes da config
    return {} as ReturnType<typeof createBrowserClient<Database>>
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
