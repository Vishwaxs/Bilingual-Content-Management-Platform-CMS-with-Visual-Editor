import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/public/LanguageToggle';
import TricolorStrip from '@/components/ui/tricolor-strip';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { glass } from '@/lib/glass';
import { SiteSearch } from '@/components/public/SiteSearch';
import { LiveVisitorCounter } from '@/components/public/LiveVisitorCounter';

const navLinks = [
  { to: '/', labelEn: 'Home', labelHi: 'मुखपृष्ठ' },
  { to: '/about', labelEn: 'About', labelHi: 'हमारे बारे में' },
  { to: '/organization', labelEn: 'Organization', labelHi: 'संगठन' },
  { to: '/leadership', labelEn: 'Leadership', labelHi: 'नेतृत्व' },
  { to: '/news', labelEn: 'News', labelHi: 'समाचार' },
  { to: '/events', labelEn: 'Events', labelHi: 'कार्यक्रम' },
  { to: '/documents', labelEn: 'Documents', labelHi: 'दस्तावेज़' },
  { to: '/join', labelEn: 'Join', labelHi: 'जुड़ें' },
  { to: '/contact', labelEn: 'Contact', labelHi: 'संपर्क' },
];

const SiteHeader = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-navy border-b-[3px] border-saffron">
        <div className="container mx-auto px-4 flex items-center justify-between h-16 sm:h-[68px]">
          {/* Logo block */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-[48px] sm:w-[52px] h-[48px] sm:h-[52px] rounded-full bg-saffron flex items-center justify-center flex-shrink-0">
              <span className="font-display text-xl sm:text-2xl font-black text-saffron-foreground leading-none">ॐ</span>
            </div>
            {/* Mobile branding - abbreviated */}
            <div className="flex lg:hidden flex-col gap-0.5">
              <span className="text-[10px] sm:text-[12px] font-body font-bold text-navy-foreground leading-none truncate">
                ABHM UP
              </span>
              <span className="text-[8px] font-devanagari text-gold-light leading-none">
                महासभा
              </span>
            </div>
            {/* Desktop branding - full */}
            <div className="hidden lg:flex flex-col">
              <span className="text-[14px] font-body font-bold text-navy-foreground leading-tight">
                Akhil Bharat Hindu Mahasabha
              </span>
              <span className="text-[11px] font-devanagari text-gold-light leading-tight">
                अखिल भारत हिन्दू महासभा
              </span>
              <span className="text-[10px] font-body text-navy-foreground/40 leading-tight">
                Uttar Pradesh — Since 1915
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13px] font-body px-3 py-2.5 rounded-md transition-all ${
                  location.pathname === link.to
                    ? 'text-saffron-light'
                    : 'text-navy-foreground/80 hover:text-navy-foreground hover:bg-navy-foreground/10'
                }`}
              >
                {t(link.labelEn, link.labelHi)}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="hidden lg:flex items-center gap-3">
            <LiveVisitorCounter />
            <SiteSearch />
            <LanguageToggle />
            <Button size="sm" className="bg-saffron text-saffron-foreground text-[12px] font-bold hover:scale-105 transition-transform">
              <Link to="/join">{t('Join Us', 'जुड़ें')}</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-3 -mr-3 text-navy-foreground hover:bg-navy-foreground/10 rounded-md transition-colors">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t border-navy-foreground/10 pb-4"
            style={{
              ...glass.dark,
              borderTop: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="px-4 py-3 block sm:hidden">
              <SiteSearch />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-6 py-3 sm:py-4 text-sm sm:text-base font-body transition-colors min-h-12 ${
                  location.pathname === link.to ? 'text-saffron-light' : 'text-navy-foreground/80 hover:text-navy-foreground'
                }`}
              >
                {t(link.labelEn, link.labelHi)}
              </Link>
            ))}
            <div className="px-6 pt-2 sm:pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <LanguageToggle />
              <Button size="sm" className="bg-saffron text-saffron-foreground text-[12px] font-bold w-full sm:w-auto">
                <Link to="/join" onClick={() => setMobileOpen(false)} className="w-full">{t('Join Us', 'जुड़ें')}</Link>
              </Button>
            </div>
          </div>
        )}
      </header>
      <TricolorStrip />
    </>
  );
};

export default SiteHeader;
