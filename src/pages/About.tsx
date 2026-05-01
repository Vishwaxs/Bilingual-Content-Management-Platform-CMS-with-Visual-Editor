import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFocusAreas } from '@/hooks/useFocusAreas';
import { useReveal } from '@/hooks/useReveal';
import { glass } from '@/lib/glass';
import { Link } from 'react-router-dom';
import flagSavarkar from '@/assets/flag-savarkar.png';
import leaderSavarkar from '@/assets/leader-savarkar.png';

// Verified historical milestones — sources: Wikipedia + ABHM official
const MILESTONES = [
  {
    year: '1907',
    title_en: 'Hindu Sabha Movement',
    title_hi: 'हिन्दू सभा आंदोलन',
    desc_en: 'Punjab Hindu Sabha founded in response to the Muslim League (1906). Hindu Sabhas emerge across United Provinces (UP), Bihar, and Punjab.',
    desc_hi: 'मुस्लिम लीग (1906) के जवाब में पंजाब हिन्दू सभा की स्थापना। संयुक्त प्रांत, बिहार और पंजाब में हिन्दू सभाओं का उदय।',
    highlight: false,
  },
  {
    year: '1911',
    title_en: 'United Provinces Hindu Sabha',
    title_hi: 'संयुक्त प्रांत हिन्दू सभा',
    desc_en: 'The United Provinces Hindu Sabha, direct precursor to ABHM UP, is established — laying the organizational foundation for the Uttar Pradesh unit.',
    desc_hi: 'संयुक्त प्रांत हिन्दू सभा की स्थापना — ABHM UP के उत्तर प्रदेश इकाई की संगठनात्मक नींव।',
    highlight: false,
  },
  {
    year: '1915',
    title_en: 'Founding at Haridwar Kumbh Mela',
    title_hi: 'हरिद्वार कुंभ मेले में स्थापना',
    desc_en: 'All India Hindu Sabha formally established during Kumbh Mela at Haridwar. Pandit Madan Mohan Malaviya presides. Lucknow (UP) hosts a preparatory session on February 17, 1915.',
    desc_hi: 'हरिद्वार कुंभ मेले में अखिल भारत हिन्दू सभा की औपचारिक स्थापना। पंडित मदन मोहन मालवीय की अध्यक्षता। 17 फरवरी 1915 को लखनऊ में प्रारंभिक अधिवेशन।',
    highlight: true,
  },
  {
    year: '1921',
    title_en: 'Name Changed to ABHM',
    title_hi: 'नाम परिवर्तन: ABHM',
    desc_en: 'At the sixth session presided over by Manindra Chandra Nandi, the organization formally renames itself Akhil Bharat Hindu Mahasabha and amends its constitution for national self-governance.',
    desc_hi: 'मनीन्द्र चंद्र नंदी की अध्यक्षता में छठे अधिवेशन में संगठन ने औपचारिक रूप से अपना नाम \'अखिल भारत हिन्दू महासभा\' रखा।',
    highlight: false,
  },
  {
    year: '1937–43',
    title_en: 'Savarkar Era',
    title_hi: 'सावरकर का कार्यकाल',
    desc_en: 'Veer Savarkar serves as national president, articulates Hindutva as political ideology, calls for militarization of Hindu society. Party reaches peak organizational strength.',
    desc_hi: 'वीर सावरकर राष्ट्रीय अध्यक्ष के रूप में हिन्दुत्व को राजनीतिक विचारधारा के रूप में स्थापित करते हैं। पार्टी की संगठनात्मक शक्ति चरम पर।',
    highlight: false,
  },
  {
    year: '1915 — Present',
    title_en: 'Continuing the Legacy in UP',
    title_hi: 'उत्तर प्रदेश में विरासत जारी',
    desc_en: 'Akhil Bharat Hindu Mahasabha Uttar Pradesh continues to work across all 75 districts of Uttar Pradesh — organizing religious programs, social service camps, and cultural events in the tradition of its founders.',
    desc_hi: 'अखिल भारत हिन्दू महासभा उत्तर प्रदेश इकाई अपने संस्थापकों की परंपरा में उत्तर प्रदेश के सभी 75 जिलों में कार्यरत है।',
    highlight: false,
  },
];

const UP_DIVISIONS = [
  { name: 'Lucknow', cities: ['Lucknow', 'Sitapur', 'Lakhimpur Kheri', 'Hardoi', 'Raebareli'] },
  { name: 'Kanpur', cities: ['Kanpur Nagar', 'Kanpur Dehat', 'Unnao', 'Fatehpur', 'Hamirpur'] },
  { name: 'Prayagraj', cities: ['Prayagraj', 'Kaushambi', 'Pratapgarh', 'Chitrakoot'] },
  { name: 'Varanasi', cities: ['Varanasi', 'Jaunpur', 'Ghazipur', 'Chandauli', 'Mirzapur'] },
  { name: 'Agra', cities: ['Agra', 'Mathura', 'Firozabad', 'Mainpuri', 'Etah'] },
];

const TimelineSection = () => {
  const { language } = useLanguage();
  const { ref, revealed } = useReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-[#FF6B00]/20 -translate-x-1/2" />

        <div className="space-y-6 sm:space-y-8">
          {MILESTONES.map((m, i) => (
            <div key={m.year} className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              {/* Timeline dot */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                <div
                  className={`rounded-full flex items-center justify-center ${m.highlight ? 'timeline-dot-pulse' : ''}`}
                  style={{
                    width: m.highlight ? '48px' : '40px',
                    height: m.highlight ? '48px' : '40px',
                    background: 'linear-gradient(135deg, #FF6B00, #FF9933)',
                  }}
                >
                  <span className="text-white font-bold text-[9px]">{m.year.split('–')[0].split(' ')[0]}</span>
                </div>
              </div>

              {/* Content card */}
              <div className={`ml-16 md:ml-0 md:w-[calc(50%-40px)] ${i % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                <div
                  className="rounded-xl p-5"
                  style={{
                    ...(m.highlight ? {
                      background: 'rgba(255, 244, 230, 0.8)',
                      borderLeft: '4px solid #FF6B00',
                      boxShadow: '0 8px 32px rgba(255,107,0,0.1)',
                    } : {
                      ...glass.light,
                      borderLeft: '3px solid #FF6B00',
                      borderRadius: '12px',
                    }),
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  <span
                    className="inline-block text-white font-bold text-sm rounded-full px-4 py-1 mb-3"
                    style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9933)' }}
                  >
                    {m.year}
                  </span>
                  <h3 className="font-display font-bold text-[#0B1F3A] text-xs sm:text-[15px] mb-2">
                    {language === 'en' ? m.title_en : m.title_hi}
                  </h3>
                  <p className="text-[11px] sm:text-[12px] text-gray-600 leading-relaxed">
                    {language === 'en' ? m.desc_en : m.desc_hi}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  const { t, language } = useLanguage();
  const { data: focusAreas } = useFocusAreas();
  const { ref: heroRef, revealed: heroRevealed } = useReveal(0.1);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* SECTION 1: Hero Banner with flag background */}
      <section
        ref={heroRef}
        className={`relative py-20 overflow-hidden transition-all duration-700 ${heroRevealed ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #122B52 100%)' }}
      >
        {/* Flag background image — subtle */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block" style={{ opacity: 0.12 }}>
          <img src={flagSavarkar} alt="" className="w-full h-full object-cover object-right" />
          <div className="absolute inset-y-0 right-[12%] w-[220px] hidden lg:block" style={{ opacity: 0.28, mixBlendMode: 'screen' }}>
            <img src={leaderSavarkar} alt="" className="w-full h-full object-contain object-center" />
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0B1F3A 40%, transparent 100%)' }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-sm mb-3 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Link to="/" className="hover:text-white/80 transition-colors">{t('Home', 'मुखपृष्ठ')}</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{t('About', 'हमारे बारे में')}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white">
            {t('About Akhil Bharat Hindu Mahasabha', 'अखिल भारत हिन्दू महासभा के बारे में')}
          </h1>
          <p className="mt-2 text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t(
              "India's oldest Hindu nationalist organization — Founded 1915, Haridwar",
              'भारत का सबसे पुराना हिन्दू राष्ट्रवादी संगठन — स्थापना 1915, हरिद्वार'
            )}
          </p>
          <p className="font-devanagari text-lg mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {language === 'en' ? 'अखिल भारत हिन्दू महासभा — उत्तर प्रदेश' : 'Akhil Bharat Hindu Mahasabha — Uttar Pradesh'}
          </p>
        </div>
      </section>

      {/* SECTION 2: Founding Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            <div className="relative">
              {/* Large "1915" watermark */}
              <div className="font-display text-4xl sm:text-[80px] md:text-[120px] font-black leading-none select-none pointer-events-none" style={{ color: 'rgba(255,107,0,0.1)' }}>
                1915
              </div>
              <div className="flex items-center gap-2.5 mb-4 -mt-10">
                <div className="w-8 h-[2px] bg-[#FF6B00]" />
                <span className="text-xs font-bold text-[#FF6B00] tracking-[.1em] uppercase">{t('OUR HISTORY', 'हमारा इतिहास')}</span>
              </div>
              <h2 className="font-display font-black text-[#0B1F3A] text-2xl sm:text-3xl leading-[1.15] mb-6">
                {t('The 1915 Haridwar Convention', '1915 हरिद्वार अधिवेशन')}
              </h2>
              <div className="space-y-4 text-sm sm:text-[15px] text-gray-600 leading-relaxed font-body">
                <p>{t(
                  'Akhil Bharat Hindu Mahasabha was formally established in April 1915 at the Kumbh Mela in Haridwar. Preparatory sessions were held at Haridwar (13 February 1915), Lucknow (17 February 1915), and Delhi (27 February 1915). The organization was originally called Sarvadeshak Hindu Sabha, changed to its present name in April 1921.',
                  'अखिल भारत हिन्दू महासभा औपचारिक रूप से अप्रैल 1915 में हरिद्वार के कुंभ मेले में स्थापित हुई। प्रारंभिक अधिवेशन हरिद्वार (13 फरवरी 1915), लखनऊ (17 फरवरी 1915) और दिल्ली (27 फरवरी 1915) में आयोजित हुए। संगठन का नाम 1921 में बदलकर अखिल भारत हिन्दू महासभा रखा गया।'
                )}</p>
                <p>{t(
                  'The formation was a response to the Morley-Minto Reforms of 1909, which introduced separate Muslim electorates, and the rise of communal politics. Eminent leaders including Pandit Madan Mohan Malaviya, Lala Lajpat Rai, Swami Shraddhanand, and others attended the founding sessions.',
                  'इसकी स्थापना 1909 के मॉर्ले-मिंटो सुधारों की प्रतिक्रिया थी, जिसने मुस्लिम अलग निर्वाचन क्षेत्र की शुरूआत की। पंडित मदन मोहन मालवीय, लाला लाजपत राय, स्वामी श्रद्धानन्द सहित प्रसिद्ध नेता संस्थापक सत्रों में शामिल हुए।'
                )}</p>
                <p>{t(
                  'In Uttar Pradesh (then United Provinces), ABHM had elected representatives in the 1925 provincial legislature elections. The United Provinces Hindu Sabha, formed in 1911, was a direct precursor to ABHM UP.',
                  'उत्तर प्रदेश (तत्कालीन संयुक्त प्रांत) में, ABHM के 1925 के प्रांतीय विधान सभा चुनावों में निर्वाचित प्रतिनिधि थे। 1911 में बनी संयुक्त प्रांत हिन्दू सभा ABHM UP की प्रत्यक्ष पूर्ववर्ती थी।'
                )}</p>
              </div>
            </div>

            {/* Timeline */}
            <TimelineSection />
          </div>
        </div>
      </section>

      {/* SECTION 3: Mission Cards */}
      <section className="py-16 bg-[#F8F6F2]">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-black text-[#0B1F3A] text-2xl sm:text-3xl text-center mb-10">{t('Our Mission', 'हमारा मिशन')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: '🛕', title: t('Dharma Raksha', 'धर्म रक्षा'), desc: t('Protection of Sanatan Dharma values and traditions', 'सनातन धर्म के मूल्यों और परंपराओं का संरक्षण') },
              { icon: '🇮🇳', title: t('National Unity', 'राष्ट्रीय एकता'), desc: t('Building a strong, united, and prosperous India', 'एक मजबूत, एकजुट और समृद्ध भारत का निर्माण') },
              { icon: '📚', title: t('Cultural Revival', 'सांस्कृतिक पुनरुत्थान'), desc: t('Reviving ancient knowledge systems and education', 'प्राचीन ज्ञान प्रणालियों और शिक्षा का पुनरुत्थान') },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-6 border border-black/[0.06] hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-bold text-[#0B1F3A] text-base sm:text-lg mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: UP Unit Coverage */}
      <section className="py-16" style={{ background: '#0B1F3A' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display font-black text-white text-2xl sm:text-3xl mb-2">{t('75 Districts Strong', '75 जिलों में मजबूत')}</h2>
            <p className="text-white/60 max-w-2xl mx-auto font-body text-sm sm:text-base">
              {t(
                'The Uttar Pradesh unit of ABHM operates across all 75 districts with active mandals and district committees.',
                'ABHM की उत्तर प्रदेश इकाई सभी 75 जिलों में सक्रिय मंडलों और जिला समितियों के साथ कार्य करती है।'
              )}
            </p>
          </div>

          {/* Division cards — glassmorphism on navy */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {UP_DIVISIONS.map((div) => (
              <div key={div.name} className="rounded-xl p-4 sm:p-5" style={glass.dark}>
                <div className="font-display font-bold text-white text-sm sm:text-lg mb-3">{div.name}</div>
                <div className="space-y-1.5">
                  {div.cities.map((city) => (
                    <div key={city} className="text-[10px] sm:text-xs text-white/50 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#FF6B00] flex-shrink-0" />
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] sm:text-xs text-white/30 mt-4">
            +50 {t('more districts across Uttar Pradesh', 'और जिले उत्तर प्रदेश में')}
          </p>
        </div>
      </section>

      {/* SECTION 5: Focus Areas */}
      {focusAreas && focusAreas.length > 0 && (
        <section className="py-16 bg-[#F8F6F2]">
          <div className="container mx-auto px-4">
            <h2 className="font-display font-black text-[#0B1F3A] text-2xl sm:text-3xl text-center mb-10">{t('Our Focus Areas', 'हमारे प्रमुख क्षेत्र')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {focusAreas.map((area) => (
                <div key={area.id} className="bg-white rounded-xl p-5 sm:p-7 border border-black/[0.06] hover:shadow-md transition-all">
                  <div className="text-2xl sm:text-[32px] mb-3">{area.icon}</div>
                  <div className="font-bold text-[#0B1F3A] text-sm sm:text-[15px] mb-1">{language === 'en' ? area.title_en : area.title_hi}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{language === 'en' ? area.description_en : area.description_hi}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default AboutPage;
