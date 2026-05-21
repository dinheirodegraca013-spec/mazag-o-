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
 * Admin Client com Fallback Seguro.
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
  : {
      // Mock Admin para persistência da interface sem backend
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ 
              data: { id: 'mock-' + Date.now(), status: 'pending', created_at: new Date().toISOString() }, 
              error: null 
            })
          })
        }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) })
      })
    } as any
