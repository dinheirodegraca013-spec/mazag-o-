
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

    // 1. Get or create customer user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', orderData.customerEmail)
      .maybeSingle()

    let userId = user?.id

    if (!userId) {
      // For demo, we assume the user might be created by trigger or manual sign up
      // In a real app, you'd handle customer creation here or in a secure server action
    }

    // 2. Insert order
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: userId || null,
        status: 'pending',
        total_value: orderData.total_value || 115.00,
        neighborhood: orderData.neighborhood
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
