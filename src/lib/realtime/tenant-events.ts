
import { createClient } from '@/lib/supabase/client';

/**
 * Realtime Subscription for Tenant Events.
 * Listens to domain and tracking events.
 */
export function subscribeToTenantEvents(tenantId: string, onEvent: (payload: any) => void) {
  const supabase = createClient();
  
  const channel = supabase
    .channel(`tenant:${tenantId}:events`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'domain_events',
        filter: `tenant_id=eq.${tenantId}`
      },
      (payload) => onEvent({ type: 'domain', ...payload.new })
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tracking_events'
      },
      (payload) => onEvent({ type: 'tracking', ...payload.new })
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
