import { supabase } from '@/integrations/supabase/client';

type AuditPayload = {
  action: 'create' | 'update' | 'delete' | 'status_change';
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
};

export async function logCmsActivity({
  action,
  entityType,
  entityId,
  details,
}: AuditPayload): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? {},
    });

    if (error) {
      console.warn('Activity log insert failed:', error.message);
    }
  } catch (error) {
    console.warn('Activity log insert failed:', error);
  }
}
