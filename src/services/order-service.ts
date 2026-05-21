
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

    // 1. Get customer user (se existir)
    // Usamos try/catch para evitar que erro de RLS ou conexão quebre o fluxo do pedido
    let userId = null
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', orderData.customerEmail)
        .maybeSingle()
      
      userId = user?.id
    } catch (e) {
      console.warn("Aviso: Falha ao buscar usuário, prosseguindo com pedido anônimo.")
    }

    // 2. Insert order
    // neighborhood e total_value são obrigatórios conforme a imagem
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: userId,
        status: 'pending',
        total_value: orderData.total_value || 115.00,
        neighborhood: orderData.neighborhood || "Geral"
      })
      .select()
      .single()

    if (error) {
      console.error("Erro Supabase:", error)
      throw error
    }
    
    return data
  }
}
