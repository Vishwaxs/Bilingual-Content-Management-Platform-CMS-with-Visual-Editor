// Glassmorphism CSS-in-JS utilities for ABHM UP website
// Apply via inline styles or spread into style prop

export const glass = {
  // Light glass — for cards on dark backgrounds (hero, navy sections)
  dark: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  },
  // White glass — for cards on light backgrounds
  light: {
    background: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'blur(12px) saturate(150%)',
    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.85)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  },
  // Saffron tinted glass — for highlighted elements
  saffron: {
    background: 'rgba(255, 107, 0, 0.12)',
    backdropFilter: 'blur(12px) saturate(160%)',
    WebkitBackdropFilter: 'blur(12px) saturate(160%)',
    border: '1px solid rgba(255, 107, 0, 0.30)',
    boxShadow: '0 8px 32px rgba(255, 107, 0, 0.12)',
  },
  // Navy tinted glass — for admin elements
  navy: {
    background: 'rgba(11, 31, 58, 0.75)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
  },
} as const;

export const glassClasses = {
  dark: 'bg-white/[0.06] backdrop-blur-lg border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]',
  light: 'bg-white/[0.72] backdrop-blur-md border border-white/[0.85] shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
  saffron: 'bg-saffron/[0.12] backdrop-blur-md border border-saffron/30 shadow-[0_8px_32px_rgba(255,107,0,0.12)]',
  navy: 'bg-[#0B1F3A]/75 backdrop-blur-lg border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.4)]',
  card: 'bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-2xl',
} as const;
