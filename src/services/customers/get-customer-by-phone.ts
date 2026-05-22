
'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export async function getCustomerByPhone(phone: string) {
  const supabase = await createClient()
  
  const cleanPhone = phone.replace(/\D/g, '')
  if (!cleanPhone || cleanPhone.length < 8) return null

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${phone}%`)
    .order('created_at', { ascending: false })
    .maybeSingle()

  if (error) {
    console.error('Erro ao buscar cliente por telefone:', error)
    return null
  }

  return data
}
