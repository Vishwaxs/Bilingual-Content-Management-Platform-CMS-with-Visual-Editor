import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, CheckCircle2 } from 'lucide-react';

interface PollOption {
  id: string;
  text_en: string;
  text_hi?: string;
}

interface Poll {
  id: string;
  question_en: string;
  question_hi: string | null;
  options: PollOption[];
  status: string;
}

// Simple fingerprint for anonymous voting
const getFingerprint = () => {
  const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

/**
 * PollWidget — displays an active poll with voting and live results.
 * Anonymous voting with fingerprint-based duplicate prevention.
 */
export function PollWidget() {
  const { t, language } = useLanguage();
  const qc = useQueryClient();
  const [voted, setVoted] = useState<string | null>(null);

  // Fetch the latest active poll
  const { data: poll } = useQuery({
    queryKey: ['active-poll'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        options: (typeof data.options === 'string' ? JSON.parse(data.options) : data.options) as PollOption[],
      } as Poll;
    },
  });

  // Fetch vote counts
  const { data: voteCounts } = useQuery({
    queryKey: ['poll-votes', poll?.id],
    queryFn: async () => {
      if (!poll) return {};
      const { data, error } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id);
      if (error) return {};
      const counts: Record<string, number> = {};
      (data ?? []).forEach((v) => {
        counts[v.option_id] = (counts[v.option_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!poll?.id,
  });

  // Check if already voted
  const fingerprint = useMemo(() => getFingerprint(), []);
  const hasVoted = localStorage.getItem(`poll-voted-${poll?.id}`) === 'true';

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      if (!poll) throw new Error('No poll');
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: poll.id,
          option_id: optionId,
          voter_fingerprint: fingerprint,
        });
      if (error) {
        if (error.code === '23505') throw new Error('Already voted');
        throw error;
      }
      localStorage.setItem(`poll-voted-${poll.id}`, 'true');
    },
    onSuccess: () => {
      setVoted('done');
      qc.invalidateQueries({ queryKey: ['poll-votes', poll?.id] });
    },
  });

  if (!poll) return null;

  const totalVotes = Object.values(voteCounts ?? {}).reduce((s, n) => s + n, 0);
  const showResults = hasVoted || voted === 'done';
  const question = language === 'hi' ? (poll.question_hi || poll.question_en) : poll.question_en;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0B1F3A, #122B52)',
      borderRadius: 16,
      padding: 24,
      border: '1px solid rgba(255,107,0,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <BarChart3 style={{ width: 16, height: 16, color: '#FF6B00' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#FF9933', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {t('Quick Poll', 'त्वरित मतदान')}
        </span>
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.4 }}>
        {question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {poll.options.map((opt) => {
          const count = voteCounts?.[opt.id] ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const optText = language === 'hi' ? (opt.text_hi || opt.text_en) : opt.text_en;

          if (showResults) {
            return (
              <div key={opt.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(255,107,0,0.15)',
                  width: `${pct}%`,
                  borderRadius: 8,
                  transition: 'width 0.5s ease',
                }} />
                <div style={{
                  position: 'relative', padding: '10px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                }}>
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{optText}</span>
                  <span style={{ fontSize: 12, color: '#FF9933', fontWeight: 700 }}>{pct}%</span>
                </div>
              </div>
            );
          }

          return (
            <button
              key={opt.id}
              onClick={() => voteMutation.mutate(opt.id)}
              disabled={voteMutation.isPending}
              style={{
                padding: '10px 14px',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,107,0,0.5)'; e.currentTarget.style.background = 'rgba(255,107,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              {optText}
            </button>
          );
        })}
      </div>

      {showResults && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <CheckCircle2 style={{ width: 12, height: 12, color: '#4ade80' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            {totalVotes} {t('votes', 'मत')} · {t('Thank you!', 'धन्यवाद!')}
          </span>
        </div>
      )}
    </div>
  );
}
