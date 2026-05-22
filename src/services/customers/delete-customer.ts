'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'

/**
 * Serviço de Exclusão de Cliente.
 * Nota: Pode falhar se houver ordens vinculadas sem cascade delete.
 */
export async function deleteCustomer(customerId: string) {
  await requireRole(['admin'])
  
  const client = supabaseAdmin || await createClient()

  // Primeiro removemos as referências nas ordens ou deixamos o banco tratar
  const { error } = await client
    .from('customers')
    .delete()
    .eq('id', customerId)

  if (error) {
    console.error('Falha na exclusão do cliente:', error)
    throw new Error(`Erro Supabase: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}
