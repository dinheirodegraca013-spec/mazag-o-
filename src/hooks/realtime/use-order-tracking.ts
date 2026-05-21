
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type OrderStatus = Database['public']['Enums']['order_status']

/**
 * Realtime Single Order Tracking Hook.
 */
export function useOrderTracking(orderId?: string) {
  const [status, setStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!supabase || !orderId) {
      setLoading(false)
      return
    }

    const getInitialStatus = async () => {
      const { data } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()
      
      if (data) setStatus(data.status as OrderStatus)
      setLoading(false)
    }

    getInitialStatus()

    const channel = supabase
      .channel(`order-track-${orderId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setStatus(payload.new.status as OrderStatus)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, orderId])

  return { status, loading }
}
