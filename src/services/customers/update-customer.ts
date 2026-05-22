
'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'

interface UpdateCustomerData {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}

/**
 * Serviço de atualização de dados do cliente.
 */
export async function updateCustomer(data: UpdateCustomerData) {
  await requireRole(['admin', 'manager', 'operator'])
  
  const supabase = supabaseAdmin || await createClient()

  const { error } = await supabase
    .from('customers')
    .update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', data.id)

  if (error) {
    console.error('Erro ao atualizar cliente:', error)
    throw new Error(`Falha na atualização: ${error.message}`)
  }

  revalidatePath('/admin')
  return { success: true }
}
