import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLeadershipProfiles } from '@/hooks/useLeadership';
import { Link } from 'react-router-dom';

const LeadershipPage = () => {
  const { t, language } = useLanguage();
  const { data: leaders, isLoading } = useLeadershipProfiles();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-[#0B1F3A] py-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80">{t('Home', 'मुखपृष्ठ')}</Link><span>›</span>
            <span className="text-white/80">{t('Leadership', 'नेतृत्व')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white">{t('Our Leadership', 'हमारा नेतृत्व')}</h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl" />
                  <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
                  <div className="mt-2 h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : leaders && leaders.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {leaders.map((leader) => {
                const initials = (leader.name_en || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={leader.id} className="bg-white border border-black/[0.08] rounded-xl overflow-hidden hover:shadow-[0_16px_40px_rgba(11,31,58,0.12)] hover:-translate-y-1 transition-all">
                    <div className="aspect-square bg-gradient-to-br from-[#0B1F3A] to-[#1A3A6B] relative flex items-center justify-center">
                      {leader.photo_url ? (
                        <img src={leader.photo_url} alt={leader.name_en} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-white/20 flex items-center justify-center font-display text-white text-3xl font-bold">{initials}</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-bold text-sm text-[#0B1F3A]">{language === 'en' ? leader.name_en : leader.name_hi}</div>
                      <div className="font-devanagari text-[11px] text-gray-500 mt-0.5">{language === 'en' ? leader.name_hi : leader.name_en}</div>
                      <div className="text-[11px] text-[#FF6B00] font-semibold mt-1.5">{language === 'en' ? leader.designation_en : leader.designation_hi}</div>
                      {leader.bio_en && <div className="text-[11px] text-gray-500 leading-relaxed mt-2">{language === 'en' ? leader.bio_en : leader.bio_hi}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-[rgba(255,107,0,0.3)] rounded-xl">
              <div className="text-4xl mb-3">👥</div>
              <div className="font-semibold text-[#0B1F3A] text-lg">{t('Leadership profiles coming soon', 'नेतृत्व प्रोफ़ाइल जल्द आ रही हैं')}</div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LeadershipPage;
