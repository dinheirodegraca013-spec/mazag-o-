
import { createClient } from "@/lib/supabase/client"

export const OrderService = {
  async createOrder(orderData: {
    customerName: string
    customerPhone: string
    customerEmail: string
    neighborhood: string
    total_value?: number
  }) {
    const supabase = createClient()

    // 1. Tentar encontrar o usuário pelo email
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

    // 2. Inserir o pedido
    // Garantimos que os valores obrigatórios estejam presentes
    const insertData = {
      customer_id: userId,
      status: 'pending' as const,
      total_value: orderData.total_value || 115.00,
      neighborhood: orderData.neighborhood || "Geral"
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Log detalhado para depuração
      console.error("Erro Supabase (Detalhado):", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(error.message || "Falha ao registrar pedido no banco de dados.")
    }
    
    return data
  }
}
