import { MessageCircle } from 'lucide-react';
import { useCmsValue } from '@/hooks/useEditableCms';

/**
 * WhatsAppButton — floating WhatsApp action button.
 * Links to the organization's WhatsApp number (CMS-driven).
 * Shows in bottom-right corner on public pages.
 */
export function WhatsAppButton() {
  const phone = useCmsValue('site:whatsapp:phone', '');

  if (!phone) return null;

  // Clean phone number: remove spaces, dashes
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const message = encodeURIComponent('Namaste 🙏 I am interested in connecting with ABHM UP.');

  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(37,211,102,0.4)',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.4)';
      }}
    >
      <MessageCircle className="w-6 h-6 text-white" fill="white" />

      {/* Tooltip */}
      <span
        className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-semibold rounded-lg
          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
      >
        Chat on WhatsApp
      </span>

      {/* Pulse ring */}
      <span
        className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping"
        style={{ animationDuration: '2s', opacity: 0.3 }}
      />
    </a>
  );
}

/**
 * Generate a WhatsApp share URL for articles/events.
 */
export function getWhatsAppShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}
