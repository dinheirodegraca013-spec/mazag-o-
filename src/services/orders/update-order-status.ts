
'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/require-role'
import { Database } from '@/types/database'
import { revalidatePath } from 'next/cache'

type OrderStatus = Database['public']['Enums']['order_status']

/**
 * Serviço de Atualização de Status Operacional.
 * Usa o cliente admin para garantir que o status seja alterado mesmo com RLS restrito.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  // 1. Garante que apenas operadores autenticados podem mexer
  const { user } = await requireRole(['admin', 'manager', 'operator'])
  
  // 2. Prefere o cliente Admin para operações críticas de status para evitar falhas de RLS
  const client = supabaseAdmin || await createClient()

  const { error } = await client
    .from('orders')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (error) {
    console.error('Falha na atualização de ordem:', error)
    // Se o erro for de RLS e não tivermos admin, tentamos com o cliente padrão como última tentativa
    if (supabaseAdmin) {
       throw new Error(`Erro Supabase: ${error.message}`)
    }
    
    const standardClient = await createClient()
    const { error: retryError } = await standardClient
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      
    if (retryError) throw new Error(retryError.message)
  }

  revalidatePath('/admin')
  return { success: true }
}
