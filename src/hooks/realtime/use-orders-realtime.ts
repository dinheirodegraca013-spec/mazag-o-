
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  customer?: {
    name: string | null
    phone: string | null
    email: string | null
  } | null
}

/**
 * Realtime Orders Hook atualizado para o novo esquema.
 */
export function useOrdersRealtime() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    if (!supabase) return
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id (name, phone, email)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setOrders(data as unknown as Order[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!supabase) return

    fetchOrders()

    const channel = supabase
      .channel('realtime-orders-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchOrders])

  return { orders, loading, refresh: fetchOrders }
}
