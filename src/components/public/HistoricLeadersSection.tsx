import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReveal } from '@/hooks/useReveal';
import { glass } from '@/lib/glass';
import leaderMalaviya from '@/assets/leader-malaviya.png';
import leaderSavarkar from '@/assets/leader-savarkar.png';
import leaderMukherjee from '@/assets/leader-mukherjee.png';
import leaderLajpatRai from '@/assets/leader-lajpatrai.png';

const LEADERS = [
  {
    id: 'malaviya',
    name_en: 'Pandit Madan Mohan Malaviya',
    name_hi: 'पंडित मदन मोहन मालवीय',
    years: '1861 – 1946',
    role_en: 'Co-Founder, ABHM (1915)',
    role_hi: 'सह-संस्थापक, ABHM (1915)',
    desc_en: 'One of the early founders of ABHM; a freedom fighter and educationist who played a key role in Hindu consolidation. Also founded Banaras Hindu University (BHU) in 1916. Presided over the first all-India session at Haridwar, 1915.',
    desc_hi: 'ABHM के प्रारंभिक संस्थापकों में से एक; एक स्वतंत्रता सेनानी और शिक्षाविद् जिन्होंने हिन्दू एकता में महत्वपूर्ण भूमिका निभाई। 1916 में काशी हिन्दू विश्वविद्यालय (BHU) की स्थापना की।',
    quote_en: 'Dharma alone is the basis of the nation\'s unity.',
    quote_hi: 'धर्म ही राष्ट्रीय एकता का आधार है।',
    image: leaderMalaviya,
  },
  {
    id: 'savarkar',
    name_en: 'Vinayak Damodar Savarkar',
    name_hi: 'विनायक दामोदर सावरकर',
    years: '1883 – 1966',
    role_en: 'National President, ABHM (1937–43)',
    role_hi: 'राष्ट्रीय अध्यक्ष, ABHM (1937–43)',
    desc_en: 'Former president of ABHM (1937–43); articulated the concept of Hindutva in his 1923 book and called to \'Hinduize all politics and militarize Hindudom.\' Spent years imprisoned in the Andaman Cellular Jail for revolutionary activities against British rule.',
    desc_hi: 'ABHM के राष्ट्रीय अध्यक्ष (1937–43); 1923 में हिन्दुत्व की अवधारणा को परिभाषित किया। ब्रिटिश राज के विरुद्ध क्रांतिकारी गतिविधियों के लिए अंडमान सेलुलर जेल में कारावास झेला।',
    quote_en: 'Militarize Hindudom and Hinduize all politics.',
    quote_hi: 'हिन्दू समाज को सैन्य शक्ति से सम्पन्न करो और सारी राजनीति को हिन्दुत्व से ओत-प्रोत करो।',
    image: leaderSavarkar,
  },
  {
    id: 'mukherjee',
    name_en: 'Dr. Shyama Prasad Mukherjee',
    name_hi: 'डॉ. श्यामा प्रसाद मुखर्जी',
    years: '1901 – 1953',
    role_en: 'National President, ABHM (1945–47)',
    role_hi: 'राष्ट्रीय अध्यक्ष, ABHM (1945–47)',
    desc_en: 'National President of ABHM (1945–47). Though later associated with Bharatiya Jana Sangh which he founded in 1951, he had formative connections with ABHM. A distinguished scholar and lawyer who championed Hindu cultural interests.',
    desc_hi: 'ABHM के राष्ट्रीय अध्यक्ष (1945–47)। 1951 में भारतीय जन संघ की स्थापना की। एक विशिष्ट विद्वान और अधिवक्ता जिन्होंने हिन्दू सांस्कृतिक हितों की पैरवी की।',
    quote_en: 'Ek desh mein do Vidhan, do Pradhan, do Nishan — Nahi chalega, Nahi chalega.',
    quote_hi: 'एक देश में दो विधान, दो प्रधान, दो निशान — नहीं चलेगा, नहीं चलेगा।',
    image: leaderMukherjee,
  },
  {
    id: 'lajpatrai',
    name_en: 'Lala Lajpat Rai',
    name_hi: 'लाला लाजपत राय',
    years: '1865 – 1928',
    role_en: 'National President, ABHM (1921)',
    role_hi: 'राष्ट्रीय अध्यक्ष, ABHM (1921)',
    desc_en: 'Presided over the Akhil Bharat Hindu Mahasabha session in 1921. Associated with nationalist Hindu causes and early ideological influence. Died of injuries sustained during the protest against the Simon Commission in Lahore, 1928.',
    desc_hi: '1921 में अखिल भारत हिन्दू महासभा के अधिवेशन की अध्यक्षता की। राष्ट्रवादी हिन्दू उद्देश्यों से जुड़े और प्रारंभिक वैचारिक प्रभाव के स्रोत। 1928 में साइमन कमीशन विरोधी प्रदर्शन में लाठी प्रहार से मृत्यु।',
    quote_en: 'There is no power in the world that can keep India in bondage.',
    quote_hi: 'दुनिया में कोई ताकत नहीं जो भारत को गुलाम रख सके।',
    image: leaderLajpatRai,
  },
];

const HistoricLeadersSection = () => {
  const { t, language } = useLanguage();
  const { ref, revealed } = useReveal();
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Auto-rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % LEADERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={ref}
      className={`py-20 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ background: '#F8F6F2' }}
    >
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-8 h-[2px] bg-[#FF6B00]" />
            <span className="text-xs font-bold text-[#FF6B00] tracking-[.1em] uppercase">
              {t('FOUNDING LEADERS', 'संस्थापक नेतृत्व')}
            </span>
            <div className="w-8 h-[2px] bg-[#FF6B00]" />
          </div>
          <h2 className="font-display font-black text-[#0B1F3A] text-3xl lg:text-[42px] leading-[1.15]">
            {t('Historic National Leaders of ABHM', 'ABHM के ऐतिहासिक राष्ट्रीय नेता')}
          </h2>
          <p className="text-gray-500 text-[15px] mt-3 max-w-xl mx-auto">
            {t(
              'Remembering the visionaries who shaped the Sanatan movement',
              'उन दूरदर्शियों को श्रद्धांजलि जिन्होंने सनातन आंदोलन को आकार दिया'
            )}
          </p>
        </div>

        {/* Leader cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {LEADERS.map((leader) => (
            <div
              key={leader.id}
              className="rounded-2xl overflow-hidden relative group"
              style={{
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 24px 48px rgba(255,107,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Photo area */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={leader.image}
                  alt={`${leader.name_en}, ${leader.role_en}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(11, 31, 58, 0.95) 0%, rgba(11, 31, 58, 0.4) 50%, transparent 100%)',
                  height: '65%',
                  top: 'auto',
                }} />
                {/* Name overlay on photo */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <div className="font-display font-bold text-white text-[15px] leading-[1.3]">
                    {language === 'en' ? leader.name_en : leader.name_hi}
                  </div>
                  <div className="font-devanagari text-xs mt-0.5" style={{ color: 'rgba(255,153,51,0.8)' }}>
                    {language === 'en' ? leader.name_hi : leader.name_en}
                  </div>
                  <div className="text-[10px] text-white/50 mt-1">{leader.years}</div>
                </div>
              </div>

              {/* Card body — glassmorphism */}
              <div className="p-4" style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.6)',
              }}>
                {/* Role badge */}
                <span className="inline-block text-[10px] font-bold tracking-[.06em] uppercase px-3 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,107,0,0.1)',
                    border: '1px solid rgba(255,107,0,0.25)',
                    color: '#FF6B00',
                  }}
                >
                  {language === 'en' ? leader.role_en : leader.role_hi}
                </span>
                {/* Description */}
                <p className="text-[12px] text-gray-600 leading-relaxed mt-2 line-clamp-4">
                  {language === 'en' ? leader.desc_en : leader.desc_hi}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quote carousel */}
        <div className="mt-14 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden" style={{ background: '#0B1F3A' }}>
          {/* Glass card overlay */}
          <div className="absolute inset-0 rounded-2xl" style={{
            ...glass.dark,
            borderRadius: '16px',
          }} />
          <div className="relative z-10">
            <div key={quoteIdx} className="quote-fade-in">
              <p className="font-display italic text-xl md:text-2xl text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                "{language === 'en' ? LEADERS[quoteIdx].quote_en : LEADERS[quoteIdx].quote_hi}"
              </p>
              <p className="text-sm font-semibold mt-3" style={{ color: '#FF9933' }}>
                — {language === 'en' ? LEADERS[quoteIdx].name_en : LEADERS[quoteIdx].name_hi}
              </p>
            </div>
            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {LEADERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuoteIdx(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i === quoteIdx ? '#FF9933' : 'rgba(255,255,255,0.2)',
                    transform: i === quoteIdx ? 'scale(1.3)' : 'scale(1)',
                  }}
                  aria-label={`Quote ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoricLeadersSection;
