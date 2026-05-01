import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import JoinSection from '@/components/public/JoinSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const JoinPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="bg-[#0B1F3A] py-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80 transition-colors">{t('Home', 'मुखपृष्ठ')}</Link>
            <span>›</span>
            <span className="text-white/80">{t('Join Us', 'जुड़ें')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white">
            {t('Join ABHM UP', 'ABHM UP से जुड़ें')}
          </h1>
          <p className="text-white/70 mt-3 max-w-3xl font-body">
            {t(
              'Submit your membership details to connect with your local district unit and participate in organization initiatives.',
              'अपने स्थानीय जिला इकाई से जुड़ने और संगठनात्मक पहल में भाग लेने हेतु सदस्यता विवरण जमा करें।'
            )}
          </p>
        </div>
      </section>

      <JoinSection />

      <Footer />
    </div>
  );
};

export default JoinPage;
