import { useState } from 'react';
import { Share2, X, Copy, Check, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ShareModalProps {
  url: string;
  title: string;
  description?: string;
}

/**
 * ShareModal — premium share button + modal with all platforms.
 * Shows WhatsApp, Twitter, Facebook, LinkedIn, Telegram, Email, Copy Link.
 */
export function ShareModal({ url, title, description }: ShareModalProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    { name: 'WhatsApp', icon: '💬', color: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}` },
    { name: 'Twitter / X', icon: '𝕏', color: '#000', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { name: 'Facebook', icon: '📘', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Telegram', icon: '✈️', color: '#0088cc', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    { name: 'LinkedIn', icon: '💼', color: '#0077B5', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'Email', icon: '✉️', color: '#6b7280', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${url}`)}` },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(t('Link copied!', 'लिंक कॉपी हो गया!'));
    setTimeout(() => setCopied(false), 2000);
  };

  // Try native share API first
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url, text: description });
        return;
      } catch { /* user cancelled, fall through to modal */ }
    }
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#FF6B00] transition-colors px-3 py-1.5 rounded-md border border-gray-200 hover:border-[#FF6B00]/30"
      >
        <Share2 className="w-3.5 h-3.5" />
        {t('Share', 'साझा करें')}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[10000] bg-black/50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-base font-bold text-[#0B1F3A]">
                {t('Share', 'साझा करें')}
              </h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span className="text-[10px] font-semibold text-gray-500 text-center">{link.name}</span>
                </a>
              ))}
            </div>

            {/* Copy link */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <input
                readOnly
                value={url}
                className="flex-1 bg-transparent text-xs text-gray-600 truncate outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FF6B00] text-white text-xs font-bold rounded-md hover:bg-[#E55A00] transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('Copied!', 'कॉपी!') : t('Copy', 'कॉपी')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
