import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { EditableText } from '@/components/editor/EditableElement';
import { translations } from '@/lib/i18n';
import LanguageToggle from './LanguageToggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: t(translations.nav.home.en, translations.nav.home.hi) },
    { to: '/about', label: t(translations.nav.about.en, translations.nav.about.hi) },
    { to: '/leadership', label: t(translations.nav.leadership.en, translations.nav.leadership.hi) },
    { to: '/news', label: t(translations.nav.news.en, translations.nav.news.hi) },
  ];

  return (
    <nav className="bg-secondary text-secondary-foreground sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-lg font-bold text-primary">ABHM</span>
          <span className="hidden sm:inline text-sm font-body opacity-80">
            <EditableText
              cmsKeyEn="nav:brand:text_en" cmsKeyHi="nav:brand:text_hi"
              fallbackEn="Akhil Bharatiya Hindu Mahasabha" fallbackHi="अखिल भारतीय हिन्दू महासभा"
            />
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? 'text-primary' : 'text-secondary-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <LanguageToggle />
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-secondary border-t border-sidebar-border pb-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-6 py-3 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? 'text-primary' : 'text-secondary-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 pt-2">
            <LanguageToggle />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
