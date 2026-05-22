
import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { Database } from '@/types/database'

type AppRole = Database['public']['Enums']['app_role']

/**
 * Buscador de role resiliente. 
 * Tenta buscar diretamente na tabela users se o RPC falhar ou não existir.
 */
export const getUserRole = cache(async (): Promise<AppRole | null> => {
  try {
    const supabase = await createClient()
    
    // 1. Tenta pegar o usuário autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 2. Tenta buscar na tabela de usuários do esquema público
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (userData && !userError) {
      return userData.role as AppRole
    }

    // 3. Fallback para RPC se configurado
    const { data: roleRpc } = await supabase.rpc('get_user_role')
    if (roleRpc) return roleRpc as AppRole

    return null
  } catch (e) {
    console.error("Erro ao recuperar role:", e)
    return null
  }
})
