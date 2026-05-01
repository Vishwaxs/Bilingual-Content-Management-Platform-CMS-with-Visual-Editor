import { useLanguage } from '@/contexts/LanguageContext';
import { useReveal } from '@/hooks/useReveal';
import { glass } from '@/lib/glass';
import flagPlain from '@/assets/flag-plain.png';

const FLAG_SYMBOLS = [
  {
    icon: 'ॐ',
    title_en: 'Om Symbol (ॐ)',
    title_hi: 'ओम प्रतीक (ॐ)',
    desc_en: 'The sacred syllable representing the divine consciousness and the eternal sound of the universe in Vedic tradition.',
    desc_hi: 'पवित्र ध्वनि जो वैदिक परंपरा में ब्रह्मांड की अनंत ध्वनि और दिव्य चेतना का प्रतिनिधित्व करती है।',
  },
  {
    icon: '卐',
    title_en: 'Swastika (स्वस्तिक)',
    title_hi: 'स्वस्तिक',
    desc_en: 'Ancient Hindu auspicious symbol representing good fortune, prosperity, and the eternal cycle of dharma. A sacred symbol used in Hindu ceremonies for thousands of years.',
    desc_hi: 'प्राचीन हिन्दू शुभ प्रतीक जो सौभाग्य, समृद्धि और धर्म के अनंत चक्र का प्रतिनिधित्व करता है। हजारों वर्षों से हिन्दू अनुष्ठानों में प्रयुक्त।',
  },
  {
    icon: '⚔',
    title_en: 'Khadga (Sword)',
    title_hi: 'खड्ग (तलवार)',
    desc_en: 'Symbolizes the defense of Dharma, the protection of Hindu civilization, and the spirit of Kshatriya valor that has preserved our culture for millennia.',
    desc_hi: 'धर्म की रक्षा, हिन्दू सभ्यता के संरक्षण और क्षत्रिय वीरता की भावना का प्रतीक।',
  },
  {
    icon: '🌸',
    title_en: 'Lotus Flowers (कमल)',
    title_hi: 'कमल पुष्प',
    desc_en: 'The lotus represents purity, spiritual awakening, and the flowering of Hindu culture even amid challenging circumstances — rising from mud yet untouched by it.',
    desc_hi: 'कमल पवित्रता, आध्यात्मिक जागरण और हिन्दू संस्कृति के उत्कर्ष का प्रतीक है — कीचड़ में उगता है पर अस्पृश्य रहता है।',
  },
];

const PartyFlagSection = () => {
  const { t, language } = useLanguage();
  const { ref, revealed } = useReveal();

  return (
    <section
      ref={ref}
      className={`py-20 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ background: '#F8F6F2' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4 sm:gap-8 lg:gap-12 items-center">
          {/* LEFT — Text content with symbol explanations */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-[2px] bg-[#FF6B00]" />
              <span className="text-xs font-bold text-[#FF6B00] tracking-[.1em] uppercase">
                {t('PARTY FLAG', 'दल ध्वज')}
              </span>
            </div>
            <h2 className="font-display font-black text-[#0B1F3A] text-2xl sm:text-3xl lg:text-[42px] leading-[1.15] mb-4">
              {t('The Party Flag', 'दल का ध्वज')}
            </h2>
            <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-8 font-body">
              {t(
                'The saffron flag of Akhil Bharat Hindu Mahasabha is a sacred symbol of Hindu pride, cultural renaissance, and national awakening. Each symbol on the flag carries deep spiritual significance rooted in Sanatan Dharma.',
                'अखिल भारत हिन्दू महासभा का भगवा ध्वज हिन्दू गौरव, सांस्कृतिक पुनर्जागरण और राष्ट्रीय जागरण का पवित्र प्रतीक है।'
              )}
            </p>

            {/* Symbol explanation cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {FLAG_SYMBOLS.map((sym) => (
                <div
                  key={sym.title_en}
                  className="rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  style={{ ...glass.light, borderRadius: '12px' }}
                >
                  <div className="text-3xl mb-2 font-devanagari">{sym.icon}</div>
                  <div className="font-bold text-xs sm:text-[13px] text-[#0B1F3A] mb-1">
                    {language === 'en' ? sym.title_en : sym.title_hi}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 leading-relaxed">
                    {language === 'en' ? sym.desc_en : sym.desc_hi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Flag display with premium frame */}
          <div
            className="rounded-[20px] p-4 sm:p-6 lg:p-8"
            style={{
              background: 'linear-gradient(145deg, #0B1F3A, #1A3A6B)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div className="rounded-xl overflow-hidden relative" style={{ boxShadow: '0 8px 32px rgba(255,107,0,0.25)' }}>
              <img
                src={flagPlain}
                alt={t(
                  'ABHM Party Flag — saffron background with Om symbol, Swastika, lotus flowers and sword',
                  'ABHM दल ध्वज — भगवा पृष्ठभूमि पर ॐ प्रतीक, स्वस्तिक, कमल पुष्प और खड्ग'
                )}
                className="w-full rounded-xl"
                loading="lazy"
              />
              {/* Glass info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-center" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              }}>
                <div className="font-devanagari text-white text-lg font-bold">
                  अखिल भारत हिन्दू महासभा
                </div>
                <div className="text-xs text-white/75 mt-1">
                  Established 1915 | स्थापित 1915
                </div>
              </div>
            </div>
            {/* "Since 1915" below frame */}
            <div className="text-center mt-5">
              <span className="font-display text-2xl font-black" style={{ color: '#FF9933' }}>
                {t('Since 1915', '1915 से')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartyFlagSection;
