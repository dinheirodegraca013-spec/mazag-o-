import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Validador de URL para evitar erros de inicialização críticos.
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
 * Admin Client (Server-side only).
 * Utilizado para operações que ignoram RLS.
 * Protegido por variáveis de ambiente.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = (isValidUrl(supabaseUrl) && supabaseServiceKey)
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any
