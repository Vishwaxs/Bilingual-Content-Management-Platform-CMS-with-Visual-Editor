import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const structureCards = [
  {
    titleEn: 'National Level',
    titleHi: 'राष्ट्रीय स्तर',
    bodyEn: 'National president and office-bearers guide policy direction and nationwide programs.',
    bodyHi: 'राष्ट्रीय अध्यक्ष और पदाधिकारी नीतिगत दिशा और राष्ट्रव्यापी कार्यक्रमों का मार्गदर्शन करते हैं।',
  },
  {
    titleEn: 'State Level (U.P.)',
    titleHi: 'राज्य स्तर (उ.प्र.)',
    bodyEn: 'State unit coordinates district teams and drives statewide organizational execution.',
    bodyHi: 'राज्य इकाई जिला टीमों का समन्वय करती है और राज्य-स्तरीय कार्यान्वयन चलाती है।',
  },
  {
    titleEn: 'District Level',
    titleHi: 'जिला स्तर',
    bodyEn: 'District units handle local issues, campaigns, outreach, and on-ground programs.',
    bodyHi: 'जिला इकाइयाँ स्थानीय मुद्दों, अभियानों, जनसंपर्क और जमीनी कार्यक्रमों का संचालन करती हैं।',
  },
  {
    titleEn: 'Block Level',
    titleHi: 'ब्लॉक स्तर',
    bodyEn: 'Block teams mobilize volunteers, membership support, and local event execution.',
    bodyHi: 'ब्लॉक टीमें स्वयंसेवक समन्वय, सदस्यता सहायता और स्थानीय कार्यक्रमों का क्रियान्वयन करती हैं।',
  },
];

const OrganizationPage = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="bg-[#0B1F3A] py-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80 transition-colors">{t('Home', 'मुखपृष्ठ')}</Link>
            <span>›</span>
            <span className="text-white/80">{t('Organization', 'संगठन')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white">
            {t('Organization Structure', 'संगठन संरचना')}
          </h1>
          <p className="text-white/70 mt-3 max-w-3xl font-body">
            {t(
              'National -> State -> District -> Block coordination model for clear accountability and execution.',
              'राष्ट्रीय -> राज्य -> जिला -> ब्लॉक समन्वय मॉडल, स्पष्ट जवाबदेही और क्रियान्वयन के लिए।'
            )}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {structureCards.map((card) => (
              <div key={card.titleEn} className="rounded-xl border border-black/[0.08] bg-[#F8F6F2] p-6">
                <h2 className="font-display text-xl font-bold text-[#0B1F3A]">
                  {language === 'en' ? card.titleEn : card.titleHi}
                </h2>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {language === 'en' ? card.bodyEn : card.bodyHi}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-black/[0.08] bg-[#FFF4E6] p-5 text-sm text-gray-700">
            {t(
              'Detailed unit lists and office-bearer updates are maintained through official CMS operations and periodic announcements.',
              'विस्तृत इकाई सूची और पदाधिकारी अपडेट आधिकारिक CMS संचालन और समय-समय पर घोषणाओं के माध्यम से अपडेट किए जाते हैं।'
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrganizationPage;
