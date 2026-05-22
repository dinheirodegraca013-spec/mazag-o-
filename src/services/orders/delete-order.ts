'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'

/**
 * Serviço de Exclusão de Ordem.
 */
export async function deleteOrder(orderId: string) {
  // Apenas admins podem excluir registros
  await requireRole(['admin'])
  
  const client = supabaseAdmin || await createClient()

  const { error } = await client
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (error) {
    console.error('Falha na exclusão da ordem:', error)
    throw new Error(`Erro Supabase: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}
