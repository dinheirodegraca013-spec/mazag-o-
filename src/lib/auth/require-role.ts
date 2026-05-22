
import { getUserRole } from './get-user-role'
import { requireAuth } from './require-auth'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database'

type AppRole = Database['public']['Enums']['app_role']

/**
 * Server-side RBAC Guard.
 * Permite acesso se o usuário for admin OU se estiver em ambiente de dev/sem role configurada.
 */
export async function requireRole(allowedRoles: AppRole[]) {
  const user = await requireAuth()
  const role = await getUserRole()

  // Em desenvolvimento, se não houver role no banco, permitimos acesso para não travar o setup
  if (!role && process.env.NODE_ENV === 'development') {
    return { user, role: 'admin' as AppRole }
  }

  if (!role || !allowedRoles.includes(role)) {
    // Se for um usuário autenticado mas sem a role correta
    redirect('/unauthorized')
  }

  return { user, role }
}
