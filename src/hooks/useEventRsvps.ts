import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EventRsvp {
  id: string;
  event_id: string;
  name: string;
  phone: string;
  district: string | null;
  attendees_count: number;
  created_at: string;
}

/**
 * Fetch RSVPs for a specific event (admin only).
 */
export const useEventRsvps = (eventId: string) => {
  return useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRsvp[];
    },
    enabled: !!eventId,
  });
};

/**
 * Get total RSVP count for an event (public).
 */
export const useRsvpCount = (eventId: string) => {
  return useQuery({
    queryKey: ['rsvp-count', eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!eventId,
  });
};

/**
 * Submit an RSVP (public).
 */
export const useSubmitRsvp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rsvp: {
      event_id: string;
      name: string;
      phone: string;
      district?: string;
      attendees_count?: number;
    }) => {
      const { error } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: rsvp.event_id,
          name: rsvp.name,
          phone: rsvp.phone,
          district: rsvp.district || null,
          attendees_count: rsvp.attendees_count || 1,
        });
      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already registered for this event with this phone number.');
        }
        throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['event-rsvps', vars.event_id] });
      qc.invalidateQueries({ queryKey: ['rsvp-count', vars.event_id] });
    },
  });
};
