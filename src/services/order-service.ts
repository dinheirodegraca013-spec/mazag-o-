
'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

/**
 * Service to handle order creation with maximum resilience.
 * Otimizado para preservar o endereço histórico em pedidos recorrentes vindos do site.
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
    const supabase = supabaseAdmin || await createClient()

    if (!supabase) {
      console.warn("Supabase não inicializado. Simulando sucesso da operação.")
      return { id: 'mock-' + Date.now(), status: 'pending' }
    }

    const phone = orderData.customerPhone?.trim() || "N/A"
    const email = orderData.customerEmail?.trim() || "N/A"
    const name = orderData.customerName?.trim() || "CLIENTE SITE"

    // 1. Localizar ou Criar Cliente na Base CRM
    let customerId = null
    
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('id, address, name')
      .or(`phone.eq.${phone},email.eq.${email}`)
      .maybeSingle()

    if (customer) {
      customerId = customer.id
      
      // Se vier do site (orderData.isAdminAction === false), só atualizamos o endereço se o cliente NÃO tiver um
      // Caso contrário, mantemos o endereço antigo no perfil mas registramos o pedido com a nota enviada
      const shouldUpdateAddress = orderData.isAdminAction || !customer.address;

      await supabase.from('customers').update({ 
        address: shouldUpdateAddress ? (orderData.notes || customer.address) : customer.address,
        name: name !== "CLIENTE SITE" ? name : customer.name,
        updated_at: new Date().toISOString()
      }).eq('id', customerId)
    } else {
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({
          name: name,
          phone: phone,
          email: email,
          address: orderData.notes,
          notes: 'Captado via Central de Comando Mazagão'
        })
        .select('id')
        .single()
      
      customerId = newCustomer?.id
    }

    // 2. Criar o Registro do Pedido
    // Usamos o endereço histórico (customer.address) se estivermos no site e ele existir
    const finalOrderAddress = (!orderData.isAdminAction && customer?.address) 
      ? customer.address 
      : orderData.notes;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        total: orderData.total || 115.00,
        subtotal: orderData.total || 115.00,
        notes: finalOrderAddress,
        payment_method: 'A definir'
      })
      .select()
      .single()

    if (orderError) throw new Error(orderError.message)
    
    revalidatePath('/admin')
    return order
  } catch (error: any) {
    console.error("FALHA CRÍTICA NO PROCESSAMENTO DA ORDEM:", error.message)
    throw new Error(error.message || "Erro de conexão com o banco de dados.")
  }
}
