'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

/**
 * Service to handle order creation with maximum resilience.
 */
export async function createOrder(orderData: {
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
  total?: number
  isAdminAction?: boolean
}) {
  try {
    const supabase = (orderData.isAdminAction && supabaseAdmin) ? supabaseAdmin : await createClient()

    if (!supabase) {
      console.warn("Supabase não inicializado. Simulando sucesso da operação.")
      return { id: 'mock-' + Date.now(), status: 'pending' }
    }

    const phone = orderData.customerPhone?.trim() || "N/A"
    const email = orderData.customerEmail?.trim() || "N/A"

    // 1. Find or Create Customer
    let customerId = null
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .or(`phone.eq.${phone},email.eq.${email}`)
      .maybeSingle()

    if (fetchError) {
      console.error("Erro ao buscar cliente:", fetchError)
    }

    if (customer) {
      customerId = customer.id
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
      
      if (insertError) {
        console.error("Erro ao inserir cliente:", insertError)
        // Fallback: Tentamos prosseguir sem customer_id se necessário, ou falhamos aqui
      }
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
        notes: orderData.notes
      })
      .select()
      .single()

    if (orderError) throw orderError
    
    revalidatePath('/admin')
    return order
  } catch (error: any) {
    console.error("FALHA CRÍTICA NA ORDEM:", error)
    // Se o erro for de conexão/rede no workstation, não lançamos erro 500
    // Lançamos um erro amigável que o catch do componente pode tratar.
    throw new Error(error.message || "Falha na comunicação com a Central Mazagão.")
  }
}
