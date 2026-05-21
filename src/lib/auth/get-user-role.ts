
import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { Database } from '@/types/database'

type AppRole = Database['public']['Enums']['app_role']

/**
 * Cached request-level role fetcher.
 * Uses security definer RPC for maximum security and performance.
 */
export const getUserRole = cache(async (): Promise<AppRole | null> => {
  try {
    const supabase = await createClient()
    const { data: role, error } = await supabase.rpc('get_user_role')
    
    if (error || !role) return null
    return role as AppRole
  } catch (e) {
    return null
  }
})
