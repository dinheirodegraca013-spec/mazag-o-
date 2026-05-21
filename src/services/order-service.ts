
'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Database } from "@/types/database"

export type Order = Database['public']['Tables']['orders']['Row'] & {
  customer?: Database['public']['Tables']['customers']['Row'] | null
  user?: Database['public']['Tables']['users']['Row'] | null
}

/**
 * Cria ou busca um cliente e registra um novo pedido.
 * Alinhado com o novo esquema: public.customers -> public.orders.
 */
export async function createOrder(orderData: {
  customerName: string
  customerPhone: string
  customerEmail: string
  notes?: string
  total?: number
  isAdminAction?: boolean
}) {
  const supabase = orderData.isAdminAction ? supabaseAdmin : await createClient()

  try {
    // 1. Identificar ou Criar Cliente (Prioridade por Telefone)
    let customerId = null
    const { data: customer, error: customerFetchError } = await supabase
      .from('customers')
      .select('id')
      .or(`phone.eq.${orderData.customerPhone},email.eq.${orderData.customerEmail}`)
      .maybeSingle()

    if (customer) {
      customerId = customer.id
    } else {
      const { data: newCustomer, error: customerInsertError } = await supabase
        .from('customers')
        .insert({
          name: orderData.customerName,
          phone: orderData.customerPhone,
          email: orderData.customerEmail,
          notes: 'Cliente captado via site'
        })
        .select('id')
        .single()
      
      if (customerInsertError) throw customerInsertError
      customerId = newCustomer.id
    }

    // 2. Criar o Pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        total: orderData.total || 115.00,
        subtotal: orderData.total || 115.00,
        notes: orderData.notes || 'Pedido web padrão'
      })
      .select()
      .single()

    if (orderError) throw orderError
    
    return order
  } catch (error: any) {
    console.error("Falha na criação da ordem operacional:", error)
    throw new Error(error.message || "Erro crítico ao registrar ordem no banco.")
  }
}
