import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

/**
 * LiveVisitorCounter — shows active visitors using Supabase Realtime Presence.
 * Each visitor joins a shared channel. Count updates in real-time.
 */
export function LiveVisitorCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('visitors', {
      config: { presence: { key: crypto.randomUUID?.() || Math.random().toString(36) } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (count < 2) return null; // Don't show if only 1 visitor (yourself)

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <Users className="w-3 h-3" />
      <span>{count} {count === 1 ? 'visitor' : 'visitors'} online</span>
    </div>
  );
}
