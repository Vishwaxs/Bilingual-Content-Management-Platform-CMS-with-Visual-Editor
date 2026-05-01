import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { EditableText } from '@/components/editor/EditableElement';
import { translations } from '@/lib/i18n';
import TricolorStrip from '@/components/ui/tricolor-strip';
import { usePublicContactInfo } from '@/hooks/useSiteSettings';
import { NewsletterSignup } from '@/components/public/NewsletterSignup';

const quickLinks = [
  { to: '/', label: { en: 'Home', hi: 'मुखपृष्ठ' } },
  { to: '/about', label: { en: 'About Us', hi: 'हमारे बारे में' } },
  { to: '/leadership', label: { en: 'Leadership', hi: 'नेतृत्व' } },
  { to: '/news', label: { en: 'News', hi: 'समाचार' } },
  { to: '/events', label: { en: 'Events', hi: 'कार्यक्रम' } },
];

const orgLinks = [
  { to: '/documents', label: { en: 'Documents', hi: 'दस्तावेज़' } },
  { to: '/about', label: { en: 'History', hi: 'इतिहास' } },
  { to: '/leadership', label: { en: 'State Committee', hi: 'राज्य समिति' } },
  { to: '/about', label: { en: 'Mission & Vision', hi: 'मिशन और दृष्टि' } },
];

const Footer = () => {
  const { t } = useLanguage();
  const { phone, email } = usePublicContactInfo();

  const hasDialablePhone = /^[+\d][\d\s-]{8,}$/.test(phone);
  const phoneHref = hasDialablePhone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined;
  const emailHref = `mailto:${email}`;

  const contactInfo = [
    { text: t('ABHM Bhawan, Hazratganj', 'ABHM भवन, हज़रतगंज') },
    { text: t('Lucknow, Uttar Pradesh', 'लखनऊ, उत्तर प्रदेश') },
    { text: `${t('Phone', 'फ़ोन')}: ${phone}`, href: phoneHref },
    { text: `${t('Email', 'ईमेल')}: ${email}`, href: emailHref },
  ];

  const headingClass = 'text-[11px] text-saffron-light font-bold tracking-[.08em] uppercase mb-4 font-body';
  const linkClass = 'text-[13px] text-white/55 hover:text-white transition-colors font-body';

  return (
    <footer style={{ background: 'hsl(var(--navy))' }}>
      <div className="container mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-10">
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-white">
              Akhil Bharat Hindu Mahasabha
            </h3>
            <p className="font-devanagari text-[13px] text-gold-light">
              अखिल भारत हिन्दू महासभा
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/40 tracking-wide font-body">
                UTTAR PRADESH UNIT
              </span>
              <TricolorStrip className="w-20" />
            </div>
            <p className="text-xs text-white/45 leading-[1.7] font-body max-w-xs">
              <EditableText
                cmsKeyEn="footer:tagline:text_en" cmsKeyHi="footer:tagline:text_hi"
                fallbackEn="A historic political organization dedicated to the cultural and political empowerment of the Hindu community, working for national unity since 1915."
                fallbackHi="हिंदू समुदाय के सांस्कृतिक और राजनीतिक सशक्तिकरण के लिए समर्पित एक ऐतिहासिक राजनीतिक संगठन, 1915 से राष्ट्रीय एकता के लिए कार्यरत।"
              />
            </p>
            <p className="font-devanagari text-[11px] text-gold-light/60 italic">
              धर्मो रक्षति रक्षितः
            </p>
          </div>

          <div>
            <h4 className={headingClass}>
              {t(translations.footer.quickLinks.en, translations.footer.quickLinks.hi)}
            </h4>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link key={link.to + link.label.en} to={link.to} className={linkClass}>
                  {t(link.label.en, link.label.hi)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className={headingClass}>
              {t('Organization', 'संगठन')}
            </h4>
            <div className="flex flex-col gap-2">
              {orgLinks.map((link) => (
                <Link key={link.to + link.label.en} to={link.to} className={linkClass}>
                  {t(link.label.en, link.label.hi)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className={headingClass}>
              {t(translations.footer.contactInfo.en, translations.footer.contactInfo.hi)}
            </h4>
            <div className="flex flex-col gap-2">
              {contactInfo.map((info, i) => (
                info.href ? (
                  <a
                    key={i}
                    href={info.href}
                    className="text-[13px] text-white/55 hover:text-white transition-colors font-body"
                  >
                    {info.text}
                  </a>
                ) : (
                  <span key={i} className="text-[13px] text-white/55 font-body">
                    {info.text}
                  </span>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-10 pt-8 border-t border-white/[0.08]">
          <div className="max-w-md">
            <h4 className="text-[11px] text-saffron-light font-bold tracking-[.08em] uppercase mb-3 font-body">
              {t('Newsletter', 'न्यूज़लेटर')}
            </h4>
            <p className="text-xs text-white/40 mb-3 font-body">
              {t('Get ABHM UP updates in your inbox', 'ABHM UP अपडेट अपने इनबॉक्स में पाएं')}
            </p>
            <NewsletterSignup variant="inline" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/30 font-body">
            © {new Date().getFullYear()} Akhil Bharat Hindu Mahasabha (U.P.) {t(translations.footer.rights.en, translations.footer.rights.hi)}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-white/30 font-body">
            <span className="hover:text-white/50 cursor-pointer transition-colors">{t('Privacy Policy', 'गोपनीयता नीति')}</span>
            <span>|</span>
            <span className="hover:text-white/50 cursor-pointer transition-colors">{t('Terms', 'नियम')}</span>
            <span>|</span>
            <Link to="/admin/login" className="hover:text-white/50 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
