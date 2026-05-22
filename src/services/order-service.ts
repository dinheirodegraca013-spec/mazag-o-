
'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

/**
 * Service to handle order creation with high availability.
 * This is a Server Action.
 */
export async function createOrder(orderData: {
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string // Agora obrigatório (Endereço)
  total?: number
  isAdminAction?: boolean
}) {
  const supabase = (orderData.isAdminAction && supabaseAdmin) ? supabaseAdmin : await createClient()

  try {
    if (!supabase) throw new Error("Supabase client not initialized")

    const phone = orderData.customerPhone?.trim() || "N/A"
    const email = orderData.customerEmail?.trim() || "N/A"

    // 1. Find or Create/Update Customer
    let customerId = null
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .or(`phone.eq.${phone},email.eq.${email}`)
      .maybeSingle()

    if (customer) {
      customerId = customer.id
      // Atualiza o endereço do cliente se for novo
      await supabase.from('customers').update({ 
        address: orderData.notes,
        name: orderData.customerName,
        email: email
      }).eq('id', customerId)
    } else {
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({
          name: orderData.customerName,
          phone: phone,
          email: email,
          address: orderData.notes,
          notes: 'Cliente captado via sistema Mazagão'
        })
        .select('id')
        .single()
      
      if (insertError) throw insertError
      customerId = newCustomer?.id
    }

    // 2. Create the Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        total: orderData.total || 115.00,
        subtotal: orderData.total || 115.00,
        notes: orderData.notes // Endereço de entrega desta ordem
      })
      .select()
      .single()

    if (orderError) throw orderError
    
    revalidatePath('/admin')
    return order
  } catch (error: any) {
    console.error("Falha na criação da ordem:", error)
    throw new Error(error.message || "Falha na comunicação com a Central de Comando.")
  }
}
