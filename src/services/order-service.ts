
'use server'

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Database } from "@/types/database"

export type Order = Database['public']['Tables']['orders']['Row'] & {
  users?: {
    full_name: string | null
    phone: string | null
    email: string | null
  }
}

/**
 * Registra um novo pedido no sistema.
 * Refatorado como Server Action nomeada para compatibilidade com Next.js 15.
 */
export async function createOrder(orderData: {
  customerName: string
  customerPhone: string
  customerEmail: string
  neighborhood: string
  total_value?: number
  isAdminAction?: boolean
}) {
  // 1. Inicializa Supabase (Admin para bypass ou Server para contexto de usuário)
  const supabase = orderData.isAdminAction ? supabaseAdmin : await createClient()

  if (!supabase) {
    throw new Error("Sistema de banco de dados não inicializado. Verifique as configurações.")
  }

  // 2. Tenta encontrar o usuário pelo email
  let userId = null
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', orderData.customerEmail)
      .maybeSingle()
    
    if (!userError && user) {
      userId = user.id
    }
  } catch (e) {
    console.warn("Aviso: Falha ao buscar usuário, prosseguindo com pedido anônimo.", e)
  }

  // 3. Dados de Inserção
  const insertData = {
    customer_id: userId,
    status: 'pending' as const,
    total_value: orderData.total_value || 115.00,
    neighborhood: orderData.neighborhood || "Geral"
  }

  // 4. Executa a inserção
  const { data, error } = await supabase
    .from('orders')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("Supabase Order Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    throw new Error(`Falha no banco de dados: ${error.message}`)
  }
  
  return data
}
