
import { getUserRole } from './get-user-role'
import { requireAuth } from './require-auth'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database'

type AppRole = Database['public']['Enums']['app_role']

/**
 * Server-side RBAC Guard.
 * Ensures user is authenticated and has one of the required roles.
 */
export async function requireRole(allowedRoles: AppRole[]) {
  const user = await requireAuth()
  const role = await getUserRole()

  if (!role || !allowedRoles.includes(role)) {
    redirect('/unauthorized')
  }

  return { user, role }
}
