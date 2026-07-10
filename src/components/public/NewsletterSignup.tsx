import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * NewsletterSignup — inline email subscription widget.
 * Can be placed in Footer, post-article, or standalone.
 * Inserts into email_subscribers table.
 */
export function NewsletterSignup({ variant = 'inline' }: { variant?: 'inline' | 'card' }) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .insert({ email: email.trim().toLowerCase(), language });
      if (error) {
        if (error.code === '23505') {
          toast.info(t('You are already subscribed!', 'आप पहले से सदस्य हैं!'));
          setDone(true);
        } else {
          throw error;
        }
      } else {
        setDone(true);
        toast.success(t('Subscribed successfully!', 'सफलतापूर्वक सदस्यता ली!'));
      }
    } catch (err: any) {
      toast.error(err.message || t('Subscription failed', 'सदस्यता विफल'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={`flex items-center gap-2 ${variant === 'card' ? 'justify-center py-4' : ''}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span className="text-sm text-emerald-400 font-semibold">
          {t('Subscribed!', 'सदस्यता सफल!')}
        </span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#122B52] rounded-xl p-8 text-center">
        <Mail className="w-8 h-8 text-[#FF6B00] mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold text-white mb-1">
          {t('Stay Updated', 'अपडेट रहें')}
        </h3>
        <p className="text-white/50 text-sm mb-4">
          {t('Get the latest ABHM UP news in your inbox', 'ABHM UP की ताज़ा खबरें अपने इनबॉक्स में पाएं')}
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            required
            placeholder={t('Your email', 'आपका ईमेल')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF6B00]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55A00] text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Subscribe', 'सदस्यता')}
          </button>
        </form>
      </div>
    );
  }

  // Inline variant (for footer)
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        placeholder={t('Your email', 'आपका ईमेल')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/15 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF6B00] transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white text-xs font-bold rounded-md transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : t('Subscribe', 'सदस्यता')}
      </button>
    </form>
  );
}
