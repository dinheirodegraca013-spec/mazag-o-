
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export type Customer = Database['public']['Tables']['customers']['Row'] & {
  order_count?: number
}

/**
 * Hook para monitorar a base de clientes em tempo real.
 */
export function useCustomersRealtime() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCustomers = useCallback(async () => {
    if (!supabase) return
    
    // Buscamos clientes e podemos contar ordens se necessário futuramente via RPC ou Join
    const { data, error } = await supabase
      .from('customers')
      .select(`*`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCustomers(data as Customer[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!supabase) return

    fetchCustomers()

    const channel = supabase
      .channel('realtime-customers-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          fetchCustomers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchCustomers])

  return { customers, loading, refresh: fetchCustomers }
}
