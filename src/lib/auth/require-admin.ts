
import { requireRole } from './require-role'

/**
 * Server-side Admin Guard.
 */
export async function requireAdmin() {
  return await requireRole(['admin'])
}
