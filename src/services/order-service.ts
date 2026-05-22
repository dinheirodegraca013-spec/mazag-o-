'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

/**
 * Service to handle order creation with maximum resilience.
 * Uses supabaseAdmin (service_role) by default to bypass RLS for public site orders.
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
    // Para capturar pedidos do site ou ações administrativas, preferimos o cliente Admin 
    // para evitar erros de RLS (Row Level Security) que bloqueiam usuários anônimos.
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
    
    // Busca flexível por telefone ou email
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('id, address, name')
      .or(`phone.eq.${phone},email.eq.${email}`)
      .maybeSingle()

    if (fetchError) {
      console.error("Erro ao buscar cliente:", fetchError)
    }

    if (customer) {
      customerId = customer.id
      // Atualiza os dados se for um cliente recorrente
      await supabase.from('customers').update({ 
        address: orderData.notes || customer.address,
        name: name !== "CLIENTE SITE" ? name : customer.name,
        updated_at: new Date().toISOString()
      }).eq('id', customerId)
    } else {
      // Cria novo registro de cliente
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
      
      if (insertError) {
        console.error("Erro ao inserir cliente:", insertError)
      }
      customerId = newCustomer?.id
    }

    // 2. Criar o Registro do Pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        total: orderData.total || 115.00,
        subtotal: orderData.total || 115.00,
        notes: orderData.notes,
        payment_method: 'A definir'
      })
      .select()
      .single()

    if (orderError) {
      console.error("Erro Supabase RLS/DB:", orderError)
      throw new Error(orderError.message)
    }
    
    // Revalida as rotas administrativas para atualizar o painel em tempo real
    revalidatePath('/admin')
    
    return order
  } catch (error: any) {
    console.error("FALHA CRÍTICA NO PROCESSAMENTO DA ORDEM:", error.message)
    // Lançamos o erro para que o componente OrderFunnel possa exibir o Toaster de erro
    throw new Error(error.message || "Erro de conexão com o banco de dados.")
  }
}
