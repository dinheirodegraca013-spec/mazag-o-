
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/require-role'
import { Database } from '@/types/database'
import { revalidatePath } from 'next/cache'

type OrderStatus = Database['public']['Enums']['order_status']

/**
 * Operational Order Status Service.
 * - Source of truth for all status changes.
 * - Enforces RBAC.
 * - Trigger handles audit history.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  // Guard: Only logistics roles can update
  await requireRole(['admin', 'manager', 'operator'])
  
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    console.error('Update Order Error:', error)
    throw new Error('Falha operacional ao atualizar pedido.')
  }

  revalidatePath('/admin')
  return { success: true }
}
