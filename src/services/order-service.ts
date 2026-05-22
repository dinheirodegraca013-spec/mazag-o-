
'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Service to handle order creation with high availability.
 * This is a Server Action.
 */
export async function createOrder(orderData: {
  customerName: string
  customerPhone: string
  customerEmail: string
  notes?: string
  total?: number
  isAdminAction?: boolean
}) {
  // Use admin client if requested, otherwise standard server client
  const supabase = (orderData.isAdminAction && supabaseAdmin) ? supabaseAdmin : await createClient()

  try {
    if (!supabase) throw new Error("Supabase client not initialized")

    // 1. Find or Create Customer
    let customerId = null
    
    // Clean inputs to avoid query errors
    const phone = orderData.customerPhone?.trim() || "N/A"
    const email = orderData.customerEmail?.trim() || "N/A"

    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .or(`phone.eq."${phone}",email.eq."${email}"`)
      .maybeSingle()

    if (fetchError) {
      console.warn("Aviso ao buscar cliente (pode ser RLS):", fetchError)
    }

    if (customer) {
      customerId = customer.id
    } else {
      const { data: newCustomer, error: customerInsertError } = await supabase
        .from('customers')
        .insert({
          name: orderData.customerName || "Consumidor Final",
          phone: phone,
          email: email,
          notes: 'Cliente captado via sistema Mazagão'
        })
        .select('id')
        .single()
      
      if (customerInsertError) {
        console.error("Erro ao criar cliente:", customerInsertError)
        // Se falhar a criação do cliente, tentamos seguir sem o ID (o banco pode não permitir nulo dependendo do schema)
      } else {
        customerId = newCustomer?.id
      }
    }

    // 2. Create the Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        total: orderData.total || 115.00,
        subtotal: orderData.total || 115.00,
        notes: orderData.notes || 'Operação Web Mazagão'
      })
      .select()
      .single()

    if (orderError) {
      console.error("Erro detalhado do Supabase ao criar ordem:", orderError)
      throw new Error(orderError.message)
    }
    
    return order
  } catch (error: any) {
    console.error("Falha crítica na criação da ordem:", error)
    // Retornamos um mock se estivermos em modo desenvolvimento/sem banco para não quebrar o fluxo
    if (process.env.NODE_ENV === 'development') {
      return { id: 'fallback-' + Date.now(), status: 'pending', total: orderData.total }
    }
    throw new Error(error.message || "Falha na comunicação com a Central de Comando.")
  }
}
