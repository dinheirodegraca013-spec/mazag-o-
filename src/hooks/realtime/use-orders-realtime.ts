
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  users?: {
    full_name: string | null
    phone: string | null
    email: string | null
  }
}

/**
 * Realtime Orders Hook.
 * Depends strictly on PostgreSQL RLS.
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
        users:customer_id (full_name, phone, email)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setOrders(data as Order[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!supabase) return

    fetchOrders()

    const channel = supabase
      .channel('realtime-orders')
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
