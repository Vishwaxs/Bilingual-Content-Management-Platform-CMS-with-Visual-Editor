import { useLanguage } from '@/contexts/LanguageContext';
import { usePublishedNews } from '@/hooks/useNews';
import { useLeadershipProfiles } from '@/hooks/useLeadership';
import { useUpcomingEvents } from '@/hooks/useEvents';
import { useFocusAreas } from '@/hooks/useFocusAreas';
import { useTickerItems } from '@/hooks/useSiteSettings';
import SiteHeader from '@/components/layout/SiteHeader';
import NewsTicker from '@/components/layout/NewsTicker';
import Footer from '@/components/public/Footer';
import HeroSection from '@/components/public/HeroSection';
import HistoricLeadersSection from '@/components/public/HistoricLeadersSection';
import CurrentLeadersSection from '@/components/public/CurrentLeadersSection';
import PartyFlagSection from '@/components/public/PartyFlagSection';
import JoinSection from '@/components/public/JoinSection';
import RevealSection from '@/components/public/RevealSection';
import { AnnouncementRibbon } from '@/components/public/AnnouncementRibbon';
import { PollWidget } from '@/components/public/PollWidget';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';

const FALLBACK_TICKER_ITEMS = [
  'ABHM UP State Convention announced for July 2026',
  'Gau Seva Campaign launched across all 75 districts',
  'Vedic Education Initiative reaches 500+ schools',
  'New district committees formed in Western UP',
  'अखिल भारत हिन्दू महासभा राज्य सम्मेलन जुलाई 2026 की घोषणा',
];

const FOCUS_FALLBACK = [
  { id: '1', icon: '🙏', title_en: 'Dharma Raksha', title_hi: 'धर्म रक्षा', description_en: 'Protection and promotion of Sanatan Dharma values and traditions across Uttar Pradesh.', description_hi: 'उत्तर प्रदेश में सनातन धर्म के मूल्यों और परंपराओं का संरक्षण और प्रसार।' },
  { id: '2', icon: '🐄', title_en: 'Gau Seva', title_hi: 'गौ सेवा', description_en: 'Dedicated efforts for cow protection, establishing gaushalas, and promoting awareness.', description_hi: 'गौ रक्षा, गौशालाओं की स्थापना और जागरूकता को बढ़ावा देने के लिए समर्पित प्रयास।' },
  { id: '3', icon: '📚', title_en: 'Vedic Education', title_hi: 'वैदिक शिक्षा', description_en: 'Promoting ancient Indian education system alongside modern education in schools.', description_hi: 'स्कूलों में आधुनिक शिक्षा के साथ-साथ प्राचीन भारतीय शिक्षा प्रणाली को बढ़ावा देना।' },
  { id: '4', icon: '🛕', title_en: 'Mandir Suraksha', title_hi: 'मंदिर सुरक्षा', description_en: 'Ensuring security and maintenance of Hindu temples and sacred sites.', description_hi: 'हिंदू मंदिरों और पवित्र स्थलों की सुरक्षा और रखरखाव सुनिश्चित करना।' },
  { id: '5', icon: '🤝', title_en: 'Hindu Sangathan', title_hi: 'हिंदू संगठन', description_en: 'Organizing Hindu society under one umbrella for collective strength and progress.', description_hi: 'सामूहिक शक्ति और प्रगति के लिए हिंदू समाज को एक छत्र के नीचे संगठित करना।' },
  { id: '6', icon: '❤️', title_en: 'Seva & Samajseva', title_hi: 'सेवा एवं समाजसेवा', description_en: 'Community service through health camps, disaster relief, and educational programs.', description_hi: 'स्वास्थ्य शिविर, आपदा राहत और शैक्षिक कार्यक्रमों के माध्यम से समुदाय सेवा।' },
];

const Index = () => {
  const { t, language } = useLanguage();
  const { data: news } = usePublishedNews(3);
  const { data: leaders } = useLeadershipProfiles();
  const { data: events } = useUpcomingEvents(5);
  const { data: focusAreas } = useFocusAreas();
  const { data: cmsTickerItems } = useTickerItems();

  const displayEvents = events?.slice(0, 3) ?? [];
  const displayLeaders = leaders?.slice(0, 4) ?? [];
  const displayFocus = (focusAreas && focusAreas.length > 0) ? focusAreas : FOCUS_FALLBACK;
  const tickerItems = (news ?? [])
    .map((article) => (language === 'en'
      ? (article.title_en ?? '')
      : (article.title_hi || article.title_en || '')))
    .filter((title) => title.length > 0)
    .slice(0, 5);
  const resolvedCmsTickerItems = (cmsTickerItems ?? [])
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 5);

  const resolvedTickerItems = tickerItems.length > 0
    ? tickerItems
    : resolvedCmsTickerItems.length > 0
      ? resolvedCmsTickerItems
      : FALLBACK_TICKER_ITEMS;

  return (
    <div className="min-h-screen">
      <AnnouncementRibbon />
      <NewsTicker items={resolvedTickerItems} />
      <SiteHeader />

      <HeroSection events={displayEvents} />

      {/* ── SECTION 2: ABOUT ── */}
      <RevealSection className="py-20 bg-[#F8F6F2]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Image frame / SVG Lotus */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[#0B1F3A] to-[#122B52] rounded-xl overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-48 h-48 opacity-20">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <ellipse key={deg} cx="100" cy="100" rx="25" ry="60"
                    fill="none" stroke="#FF9933" strokeWidth="1.5"
                    transform={`rotate(${deg} 100 100)`} />
                ))}
                <text x="100" y="115" textAnchor="middle" fill="#FF9933" fontSize="28" className="font-devanagari">ॐ</text>
              </svg>
              {/* Year badge */}
              <div className="absolute bottom-5 right-5 bg-[#FF6B00] text-white rounded-lg px-5 py-4 text-center shadow-[0_8px_24px_rgba(255,107,0,0.3)]">
                <div className="font-display text-[32px] font-black leading-none">1915</div>
                <div className="text-[10px] tracking-[.08em] opacity-85 mt-1">{t('EST.', 'स्थापना')}</div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-[2px] bg-[#FF6B00]" />
                <span className="text-xs font-bold text-[#FF6B00] tracking-[.1em] uppercase">{t('ABOUT US', 'हमारे बारे में')}</span>
              </div>
              <h2 className="font-display font-black text-[#0B1F3A] text-3xl lg:text-[42px] leading-[1.15]">
                {t('Serving the Nation Since 1915', '1915 से राष्ट्र की सेवा')}
              </h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mt-3 max-w-full font-body">
                {t(
                  'Akhil Bharat Hindu Mahasabha is a historic political organization founded in 1915, dedicated to the cultural and political empowerment of the Hindu community. Our Uttar Pradesh unit works across 75 districts to uphold dharmic values.',
                  'अखिल भारत हिन्दू महासभा 1915 में स्थापित एक ऐतिहासिक राजनीतिक संगठन है, जो हिंदू समुदाय के सांस्कृतिक और राजनीतिक सशक्तिकरण के लिए समर्पित है। हमारी उत्तर प्रदेश इकाई 75 जिलों में धार्मिक मूल्यों को बनाए रखने का काम करती है।'
                )}
              </p>

              {/* Principle cards */}
              <div className="flex flex-col gap-3 mt-6">
                {[
                  { icon: '🛕', title: t('Dharma', 'धर्म'), desc: t('Upholding Sanatan values', 'सनातन मूल्यों का संरक्षण') },
                  { icon: '🤝', title: t('Unity', 'एकता'), desc: t('Bringing Hindu society together', 'हिंदू समाज को एकजुट करना') },
                  { icon: '📈', title: t('Progress', 'प्रगति'), desc: t('Working for national prosperity', 'राष्ट्रीय समृद्धि के लिए कार्य') },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 bg-white rounded-lg p-3.5 border-l-[3px] border-[#FF6B00] items-start">
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-[13px] text-[#0B1F3A]">{item.title}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/about" className="inline-block mt-6 bg-[#FF6B00] hover:bg-[#FF9933] text-white font-bold px-6 py-2.5 rounded-md transition-all text-sm">
                {t('Read Full History →', 'पूरा इतिहास पढ़ें →')}
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── SECTION 3: HISTORIC LEADERS ── */}
      <HistoricLeadersSection />

      {/* ── SECTION 4: CURRENT NATIONAL LEADERSHIP ── */}
      <CurrentLeadersSection />

      {/* ── SECTION 5: PARTY FLAG SHOWCASE ── */}
      <PartyFlagSection />

      {/* ── SECTION 6: CMS LEADERSHIP (from database) ── */}
      <RevealSection className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-[2px] bg-[#FF6B00]" />
                <span className="text-xs font-bold text-[#FF6B00] tracking-[.1em] uppercase">{t('LEADERSHIP', 'नेतृत्व')}</span>
              </div>
              <h2 className="font-display font-black text-[#0B1F3A] text-3xl lg:text-[42px] leading-[1.15]">
                {t('Guiding the Mahasabha', 'महासभा का मार्गदर्शन')}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayLeaders.length > 0 ? displayLeaders.map((leader) => {
              const initials = (leader.name_en || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={leader.id} className="bg-white border border-black/[0.08] rounded-xl overflow-hidden hover:shadow-[0_16px_40px_rgba(11,31,58,0.12)] hover:-translate-y-1 hover:border-[rgba(255,107,0,0.2)] transition-all cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-[#0B1F3A] to-[#1A3A6B] relative flex items-center justify-center">
                    {leader.photo_url ? (
                      <img src={leader.photo_url} alt={leader.name_en} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-18 h-18 rounded-full bg-white/15 border-2 border-white/20 flex items-center justify-center font-display text-white text-2xl font-bold">
                        {initials}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(255,153,51,0.1),transparent_60%)]" />
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-sm text-[#0B1F3A] leading-snug">
                      {language === 'en' ? leader.name_en : (leader.name_hi || leader.name_en)}
                    </div>
                    <div className="font-devanagari text-[11px] text-gray-500 mt-0.5">
                      {language === 'en' ? leader.name_hi : leader.name_en}
                    </div>
                    <div className="text-[11px] text-[#FF6B00] font-semibold mt-1.5 tracking-[.02em]">
                      {language === 'en' ? leader.designation_en : (leader.designation_hi || leader.designation_en)}
                    </div>
                    {leader.bio_en && (
                      <div className="text-[11px] text-gray-500 leading-relaxed mt-2 line-clamp-3">
                        {language === 'en' ? leader.bio_en : (leader.bio_hi || leader.bio_en)}
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-black/[0.08] rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
          {leaders && leaders.length > 4 && (
            <div className="text-center mt-8">
              <Link to="/leadership" className="border border-[#0B1F3A]/20 text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white px-6 py-2.5 rounded-md transition-all font-semibold text-sm inline-block">
                {t('View All Leaders →', 'सभी नेता देखें →')}
              </Link>
            </div>
          )}
        </div>
      </RevealSection>

      {/* ── SECTION 7: NEWS ── */}
      <RevealSection className="py-20 bg-[#F8F6F2]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-[2px] bg-[#FF6B00]" />
                <span className="text-xs font-bold text-[#FF6B00] tracking-[.1em] uppercase">{t('LATEST NEWS', 'ताज़ा समाचार')}</span>
              </div>
              <h2 className="font-display font-black text-[#0B1F3A] text-3xl lg:text-[42px] leading-[1.15]">
                {t('Stay Informed', 'सूचित रहें')}
              </h2>
            </div>
            <Link to="/news" className="text-[#FF6B00] text-sm font-semibold hover:underline hidden md:block">
              {t('View All →', 'सभी देखें →')}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news && news.length > 0 ? news.map((article) => (
              <Link to={`/news/${article.slug}`} key={article.id}
                className="bg-white rounded-xl overflow-hidden border border-black/[0.06] hover:shadow-[0_12px_32px_rgba(11,31,58,0.1)] hover:-translate-y-0.5 transition-all group">
                <div className="aspect-video relative bg-gradient-to-br from-[#0B1F3A] to-[#1A3A6B]">
                  {article.featured_image ? (
                    <img src={article.featured_image} alt={article.title_en} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl opacity-[0.07] font-devanagari text-white">ॐ</div>
                  )}
                  <div className="absolute top-3 left-3 bg-[#FF6B00] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {article.category || 'news'}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mb-2">
                    {article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : ''}
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    ABHM UP
                  </div>
                  <div className="font-bold text-[15px] text-[#0B1F3A] leading-snug mb-2 group-hover:text-[#FF6B00] transition-colors">
                    {language === 'en' ? article.title_en : (article.title_hi || article.title_en)}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {language === 'en' ? article.excerpt_en : (article.excerpt_hi || article.excerpt_en)}
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-black/[0.06] flex justify-between items-center">
                  <span className="text-[#FF6B00] text-xs font-semibold">{t('Read more →', 'और पढ़ें →')}</span>
                </div>
              </Link>
            )) : (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-black/[0.06] animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link to="/news" className="text-[#FF6B00] text-sm font-semibold">{t('View All News →', 'सभी समाचार देखें →')}</Link>
          </div>
        </div>
      </RevealSection>

      {/* ── SECTION 8: EVENTS ── */}
      <RevealSection className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-[2px] bg-[#FF6B00]" />
            <span className="text-xs font-bold text-[#FF6B00] tracking-[.1em] uppercase">{t('EVENTS', 'कार्यक्रम')}</span>
          </div>
          <h2 className="font-display font-black text-[#0B1F3A] text-3xl lg:text-[42px] leading-[1.15] mb-10">
            {t('Upcoming Events', 'आगामी कार्यक्रम')}
          </h2>
          <div className="flex flex-col gap-4">
            {(events && events.length > 0) ? events.slice(0, 5).map((evt) => {
              const date = evt.event_date ? new Date(evt.event_date) : null;
              return (
                <div key={evt.id} className="grid grid-cols-[72px_1fr_auto] gap-5 border border-black/[0.08] rounded-lg p-5 items-center hover:border-[rgba(255,107,0,0.25)] hover:shadow-[0_4px_16px_rgba(11,31,58,0.08)] transition-all">
                  <div className="bg-[#FFF4E6] border border-[rgba(255,107,0,0.2)] rounded-lg text-center px-1.5 py-2.5">
                    <div className="font-display text-2xl font-black text-[#FF6B00] leading-none">
                      {date ? format(date, 'd') : '?'}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 tracking-[.04em] mt-0.5">
                      {date ? format(date, 'MMM').toUpperCase() : 'TBA'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-[#0B1F3A] mb-0.5">
                      {language === 'en' ? evt.title_en : (evt.title_hi || evt.title_en)}
                    </div>
                    <div className="font-devanagari text-xs text-gray-500 mb-1.5">
                      {language === 'en' ? evt.title_hi : evt.title_en}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {evt.location_en && (
                        <span className="flex items-center gap-1 bg-[#F8F6F2] border border-black/[0.08] rounded-full px-3 py-0.5 text-[11px] text-gray-500">
                          <MapPin className="w-3 h-3" /> {language === 'en' ? evt.location_en : (evt.location_hi || evt.location_en)}
                        </span>
                      )}
                      {evt.event_time && (
                        <span className="flex items-center gap-1 bg-[#F8F6F2] border border-black/[0.08] rounded-full px-3 py-0.5 text-[11px] text-gray-500">
                          <Clock className="w-3 h-3" /> {evt.event_time}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="self-end">
                    <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-[11px] font-semibold">
                      {t('Upcoming', 'आगामी')}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-gray-400 py-8">{t('No upcoming events scheduled', 'कोई आगामी कार्यक्रम निर्धारित नहीं')}</p>
            )}
          </div>
          <div className="text-center mt-8">
            <Link to="/events" className="border border-[#0B1F3A]/20 text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white px-6 py-2.5 rounded-md transition-all font-semibold text-sm inline-block">
              {t('View All Events →', 'सभी कार्यक्रम देखें →')}
            </Link>
          </div>
        </div>
      </RevealSection>

      {/* ── SECTION 9: FOCUS AREAS ── */}
      <RevealSection className="py-20" style={{ background: '#0B1F3A' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-8 h-[2px] bg-[#FF6B00]" />
              <span className="text-xs font-bold text-[#FF6B00] tracking-[.1em] uppercase">{t('FOCUS AREAS', 'प्रमुख क्षेत्र')}</span>
              <div className="w-8 h-[2px] bg-[#FF6B00]" />
            </div>
            <h2 className="font-display font-black text-white text-3xl lg:text-[42px] leading-[1.15]">
              {t('Our Mission & Focus', 'हमारा मिशन और ध्यान')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {displayFocus.map((area) => (
              <div key={area.id} className="bg-white/[0.05] border border-white/10 rounded-lg p-7 hover:bg-white/[0.08] hover:border-[rgba(255,107,0,0.3)] hover:-translate-y-0.5 transition-all"
                style={{ backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)' }}
              >
                <div className="text-[32px] mb-3.5">{area.icon}</div>
                <div className="font-bold text-[15px] text-white mb-1">
                  {language === 'en' ? area.title_en : (area.title_hi || area.title_en)}
                </div>
                <div className="font-devanagari text-xs text-[#FF9933] mb-2.5">
                  {language === 'en' ? area.title_hi : area.title_en}
                </div>
                <div className="text-xs text-white/55 leading-relaxed">
                  {language === 'en' ? area.description_en : (area.description_hi || area.description_en)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── SECTION 9.5: POLL ── */}
      <RevealSection className="py-16 bg-[#F8F6F2]">
        <div className="container mx-auto px-4 max-w-lg">
          <PollWidget />
        </div>
      </RevealSection>

      {/* ── SECTION 10: JOIN CTA + MEMBERSHIP FORM ── */}
      <JoinSection />

      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Index;
