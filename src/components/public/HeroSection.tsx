import { useLanguage } from '@/contexts/LanguageContext';
import { EditableText } from '@/components/editor/EditableElement';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import TricolorStrip from '@/components/ui/tricolor-strip';
import { format } from 'date-fns';
import { glass } from '@/lib/glass';
import { PartyFlagSVG } from '@/components/ui/PartyFlagSVG';

interface Event {
  id: string;
  title_en: string;
  title_hi: string;
  event_date?: string | null;
  event_time?: string | null;
  location_en?: string | null;
  location_hi?: string | null;
}

interface HeroSectionProps {
  events?: Event[];
}

const stats = [
  { value: '1915', label: { en: 'FOUNDED', hi: 'स्थापना' } },
  { value: '75', label: { en: 'DISTRICTS', hi: 'जिले' } },
  { value: '5L+', label: { en: 'MEMBERS', hi: 'सदस्य' } },
  { value: '500+', label: { en: 'MANDALS', hi: 'मंडल' } },
];

const HeroSection = ({ events = [] }: HeroSectionProps) => {
  const { t, field } = useLanguage();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen md:min-h-[88vh] flex items-center overflow-hidden hero-section">
      {/* Tricolor strip at very top */}
      <TricolorStrip className="absolute top-0 left-0 right-0 z-50" />

      {/* Mesh animated background */}
      <div className="absolute inset-0 hero-mesh" />

      {/* Multi-layer radial gradients for depth */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 60% 80% at 85% 45%, rgba(255,107,0,0.18) 0%, transparent 65%),
          radial-gradient(ellipse 40% 60% at 15% 75%, rgba(201,148,42,0.08) 0%, transparent 55%)
        `
      }} />

      {/* OM watermark — hide on very small screens */}
      <div
        className="absolute select-none pointer-events-none font-devanagari hidden sm:block"
        style={{
          fontSize: '400px',
          fontWeight: 400,
          opacity: 0.035,
          left: '5%',
          top: '50%',
          color: '#FF9933',
          lineHeight: 1,
          transform: `translateY(-50%) rotate(-15deg) translateY(${scrollY * 0.1}px)`,
          zIndex: 0,
        }}
      >
        ॐ
      </div>

      {/* Party flag — repositioned lower and right */}
      <div className="absolute inset-0 hidden lg:block z-[2] overflow-hidden">
        {/* Flag SVG — moved down to lower position */}
        <div className="absolute -right-[50px] top-[55%] -translate-y-1/2 w-[650px] h-[650px]">
          <PartyFlagSVG className="w-full h-full flag-wave" style={{ opacity: 0.75 }} />
        </div>

        {/* Dark scrim overlay — strong on left, fades to transparent on right */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(90deg,
              rgba(11, 31, 58, 0.85) 0%,
              rgba(11, 31, 58, 0.75) 25%,
              rgba(11, 31, 58, 0.4) 50%,
              rgba(11, 31, 58, 0.1) 75%,
              transparent 100%)
          `,
          pointerEvents: 'none',
        }} />
      </div>

      {/* Mobile flag — subtle full-bleed background with dark overlay */}
      <div
        className="absolute inset-0 lg:hidden z-[1]"
        style={{
          backgroundImage: 'url(/abhm-flag.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
        }}
      />
      <div className="absolute inset-0 lg:hidden z-[1.5]" style={{
        background: 'rgba(11, 31, 58, 0.6)',
        pointerEvents: 'none',
      }} />

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-20">
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start lg:items-center"
          style={{ opacity: Math.max(0, 1 - scrollY / 800) }}
        >
          {/* LEFT — Hero text content */}
          <div className="space-y-6">
            {/* Eyebrow badge — glassmorphism variant with responsive sizing */}
            <div
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium"
              style={{
                background: 'rgba(255, 107, 0, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 107, 0, 0.5)',
                color: '#FFAA33',
                textShadow: '0 2px 4px rgba(0,0,0,0.4)'
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron" />
              </span>
              <EditableText
                cmsKeyEn="hero:badge:text_en" cmsKeyHi="hero:badge:text_hi"
                fallbackEn="OFFICIAL UTTAR PRADESH UNIT" fallbackHi="उत्तर प्रदेश आधिकारिक इकाई"
                as="span"
              />
            </div>

            {/* H1 — Clean 3-line title, responsive sizing */}
            <h1 className="font-display font-black text-white leading-[1.06]" style={{
              fontSize: 'clamp(32px, 8vw, 66px)',
              textShadow: '0 6px 20px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)'
            }}>
              Akhil Bharat<br />
              Hindu<br />
              <span style={{ color: '#FF9933', textShadow: '0 6px 20px rgba(0,0,0,0.8), 0 0 40px rgba(255,153,51,0.5)' }}>Mahasabha</span>
            </h1>

            {/* Tagline — strong shadow for readability */}
            <p className="text-base max-w-[520px] font-body leading-relaxed" style={{
              color: 'rgba(255,255,255,0.98)',
              textShadow: '0 4px 12px rgba(0,0,0,0.6)',
              marginTop: '24px'
            }}>
              <EditableText
                cmsKeyEn="hero:tagline:text_en" cmsKeyHi="hero:tagline:text_hi"
                fallbackEn="Serving Sanatan Dharma and the nation with unwavering dedication since 1915. Rooted in the Vedic tradition of Uttar Pradesh."
                fallbackHi="1915 से सनातन धर्म और राष्ट्र की अटूट निष्ठा के साथ सेवा। उत्तर प्रदेश की वैदिक परंपरा में निहित।"
              />
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="font-body text-base bg-saffron hover:bg-saffron/90 text-white hover:brightness-110 hover:-translate-y-0.5 transition-all" style={{ boxShadow: '0 4px 16px rgba(255,107,0,0.3)' }}>
                <Link to="/about">{t('Our Mission', 'हमारा मिशन')}</Link>
              </Button>
              <Button asChild size="lg" className="font-body text-base text-white hover:-translate-y-0.5 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
              >
                <Link to="/news">{t('Latest News', 'ताज़ा समाचार')}</Link>
              </Button>
            </div>

            {/* Stats row — with gradient effect using responsive sizing */}
            <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 pt-8 sm:pt-10 mt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
              {stats.map((s, idx) => (
                <div key={s.value} className="text-center">
                  <div
                    className="font-display font-black"
                    style={{
                      fontSize: 'clamp(24px, 6vw, 34px)',
                      background: idx % 2 === 0
                        ? 'linear-gradient(135deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-mid)) 50%, hsl(var(--gradient-end)) 100%)'
                        : 'linear-gradient(135deg, hsl(var(--gradient-mid)) 0%, hsl(var(--gradient-end)) 50%, hsl(var(--gradient-start)) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 4px 12px rgba(255,107,0,0.5)) drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.06em] mt-2 uppercase font-body font-semibold"
                    style={{
                      background: 'linear-gradient(90deg, hsl(var(--gradient-mid)) 0%, hsl(var(--gradient-end)) 50%, hsl(var(--gradient-start)) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
                    }}
                  >
                    {t(s.label.en, s.label.hi)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Glassmorphism events panel — positioned above flag */}
          <div className="hidden lg:block rounded-2xl p-7 relative" style={{
            ...glass.dark,
            borderRadius: '16px',
            marginTop: '20px',
          }}>
            <TricolorStrip className="rounded-t-2xl -mt-7 -mx-7 mb-5" />
            <h3 className="text-[11px] uppercase tracking-[.1em] font-bold mb-5 font-body" style={{ color: '#FF9933' }}>
              📅 {t('UPCOMING EVENTS', 'आगामी कार्यक्रम')}
            </h3>
            <div className="space-y-4">
              {events.length > 0 ? events.slice(0, 3).map((ev) => (
                <div key={ev.id} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-saffron flex flex-col items-center justify-center text-white">
                    {ev.event_date ? (
                      <>
                        <span className="text-sm font-bold leading-none">{format(new Date(ev.event_date), 'd')}</span>
                        <span className="text-[9px] uppercase">{format(new Date(ev.event_date), 'MMM')}</span>
                      </>
                    ) : (
                      <Calendar className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-white truncate">{field(ev, 'title')}</p>
                    {(ev.location_en || ev.location_hi) && (
                      <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <MapPin className="h-3 w-3" />
                        {field(ev, 'location')}
                      </p>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('No upcoming events', 'कोई आगामी कार्यक्रम नहीं')}</p>
              )}
            </div>
            <Link to="/events" className="inline-block mt-5 text-sm font-medium hover:text-saffron transition-colors" style={{ color: '#FF9933' }}>
              {t('View all events →', 'सभी कार्यक्रम देखें →')}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-30" />
    </section>
  );
};

export default HeroSection;
