import { useLanguage } from '@/contexts/LanguageContext';
import { EditableText } from '@/components/editor/EditableElement';

const principles = [
  {
    icon: '🕉',
    title: { en: 'Dharma Raksha', hi: 'धर्म रक्षा' },
    desc: { en: 'Protection of Vedic traditions and Sanatan values', hi: 'वैदिक परंपराओं और सनातन मूल्यों की रक्षा' },
  },
  {
    icon: '🐄',
    title: { en: 'Gau Seva & Raksha', hi: 'गौ सेवा एवं रक्षा' },
    desc: { en: 'Cow welfare programs across all 75 districts', hi: 'सभी 75 जिलों में गौ कल्याण कार्यक्रम' },
  },
  {
    icon: '🎓',
    title: { en: 'Vedic Education', hi: 'वैदिक शिक्षा' },
    desc: { en: 'Sanskrit pathshalas and Gurukul education system', hi: 'संस्कृत पाठशालाएं और गुरुकुल शिक्षा प्रणाली' },
  },
];

const LotusOMSvg = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full">
    <defs>
      <linearGradient id="lotusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--navy))" />
        <stop offset="100%" stopColor="hsl(var(--navy-mid))" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#lotusGrad)" />
    {/* Lotus petals */}
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <ellipse
        key={angle}
        cx="200"
        cy="200"
        rx="35"
        ry="80"
        fill="none"
        stroke="rgba(255,107,0,0.15)"
        strokeWidth="1.5"
        transform={`rotate(${angle} 200 200)`}
      />
    ))}
    {/* Inner circle */}
    <circle cx="200" cy="200" r="45" fill="none" stroke="rgba(255,107,0,0.2)" strokeWidth="1" />
    {/* OM symbol */}
    <text x="200" y="215" textAnchor="middle" fontSize="52" fill="rgba(255,153,51,0.4)" fontFamily="'Noto Sans Devanagari', sans-serif">
      ॐ
    </text>
  </svg>
);

const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-off-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Lotus SVG */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg scroll-reveal">
            <LotusOMSvg />
            <div className="absolute bottom-4 right-4 bg-saffron text-white px-4 py-2 rounded-lg shadow-lg shadow-saffron/30 text-sm font-bold font-display">
              1915 / {t('ESTABLISHED', 'स्थापित')}
            </div>
          </div>

          {/* Right — Content */}
          <div className="space-y-6 scroll-reveal">
            <div>
              <span className="text-xs text-saffron font-bold uppercase tracking-widest font-body">
                <EditableText
                  cmsKeyEn="about:label:text_en" cmsKeyHi="about:label:text_hi"
                  fallbackEn="Who We Are" fallbackHi="हम कौन हैं"
                />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                <EditableText
                  cmsKeyEn="about:heading:text_en" cmsKeyHi="about:heading:text_hi"
                  fallbackEn="Protectors of Sanatan Dharma Since 1915" fallbackHi="1915 से सनातन धर्म के रक्षक"
                />
              </h2>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed">
              <EditableText
                cmsKeyEn="about:body:text_en" cmsKeyHi="about:body:text_hi"
                fallbackEn="Founded under the guidance of Pandit Madan Mohan Malaviya in 1915, the Akhil Bharat Hindu Mahasabha has been at the forefront of cultural preservation and national service. The Uttar Pradesh unit operates across all 75 districts, carrying forward the legacy of Veer Savarkar and other great leaders."
                fallbackHi="1915 में पंडित मदन मोहन मालवीय के मार्गदर्शन में स्थापित, अखिल भारत हिन्दू महासभा सांस्कृतिक संरक्षण और राष्ट्रीय सेवा में अग्रणी रही है। उत्तर प्रदेश इकाई सभी 75 जिलों में वीर सावरकर और अन्य महान नेताओं की विरासत को आगे बढ़ा रही है।"
              />
            </p>

            <div className="space-y-3">
              {principles.map((p) => (
                <div key={p.icon} className="flex gap-4 items-start bg-card p-4 rounded-lg border-l-[3px] border-saffron">
                  <span className="text-2xl flex-shrink-0">{p.icon}</span>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{t(p.title.en, p.title.hi)}</h4>
                    <p className="text-sm text-muted-foreground font-body">{t(p.desc.en, p.desc.hi)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
