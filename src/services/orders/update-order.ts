
'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'

interface UpdateOrderData {
  orderId: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
  total?: number
}

/**
 * Serviço de Atualização Integral de Pedido.
 * Permite alterar dados do pedido e do cliente vinculado.
 */
export async function updateOrder(data: UpdateOrderData) {
  await requireRole(['admin', 'manager', 'operator'])
  
  const supabase = supabaseAdmin || await createClient()

  // 1. Buscar o pedido para encontrar o customer_id
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('customer_id')
    .eq('id', data.orderId)
    .single()

  if (fetchError || !order) {
    throw new Error('Pedido não encontrado para atualização.')
  }

  // 2. Atualizar dados do cliente se fornecidos
  if (order.customer_id && (data.customerName || data.customerPhone || data.customerEmail || data.notes)) {
    await supabase.from('customers').update({
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail,
      address: data.notes, // Sincroniza endereço principal com as notas da entrega
      updated_at: new Date().toISOString()
    }).eq('id', order.customer_id)
  }

  // 3. Atualizar dados da ordem
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      notes: data.notes,
      total: data.total,
      updated_at: new Date().toISOString()
    })
    .eq('id', data.orderId)

  if (updateError) {
    console.error('Erro ao atualizar ordem:', updateError)
    throw new Error(`Falha na atualização: ${updateError.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}
