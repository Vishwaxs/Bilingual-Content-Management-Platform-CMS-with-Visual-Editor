import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCmsValue } from '@/hooks/useEditableCms';

/**
 * AnnouncementRibbon — CMS-driven dismissable announcement bar.
 * Sits above the news ticker at the top of public pages.
 * Controlled by CMS key: announcement:banner:text_en / text_hi
 * Dismiss persists in localStorage keyed by content hash.
 */
export function AnnouncementRibbon() {
  const { language } = useLanguage();
  const textEn = useCmsValue('announcement:banner:text_en', '');
  const textHi = useCmsValue('announcement:banner:text_hi', '');

  const text = language === 'hi' ? (textHi || textEn) : (textEn || textHi);
  const [dismissed, setDismissed] = useState(true);

  // Hash the text to key the dismiss state — new announcement resets the dismiss
  const hash = text ? btoa(unescape(encodeURIComponent(text.slice(0, 60)))) : '';
  const storageKey = `abhm-announcement-dismissed-${hash}`;

  useEffect(() => {
    if (!text) return;
    const wasDismissed = localStorage.getItem(storageKey);
    if (!wasDismissed) setDismissed(false);
  }, [text, storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  if (!text || dismissed) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #FF6B00, #E55A00)',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        position: 'relative',
        zIndex: 51,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <span className="text-center flex-1">{text}</span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: 4,
          padding: 4,
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}
