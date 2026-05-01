import { useLanguage } from '@/contexts/LanguageContext';
import { EditableText } from '@/components/editor/EditableElement';
import { MandalaBg } from '@/components/ui/MandalaBg';

const focusAreas = [
  { icon: '🕉', title: { en: 'Dharma Raksha', hi: 'धर्म रक्षा' }, desc: { en: 'Protecting Vedic traditions and cultural heritage across all of India', hi: 'पूरे भारत में वैदिक परंपराओं और सांस्कृतिक विरासत की रक्षा' } },
  { icon: '🐄', title: { en: 'Gau Seva', hi: 'गौ सेवा' }, desc: { en: 'Cow welfare and protection programs operating in every district', hi: 'हर जिले में गौ कल्याण और संरक्षण कार्यक्रम' } },
  { icon: '🎓', title: { en: 'Vedic Education', hi: 'वैदिक शिक्षा' }, desc: { en: 'Sanskrit pathshalas and Gurukul-based education for youth', hi: 'युवाओं के लिए संस्कृत पाठशाला और गुरुकुल शिक्षा' } },
  { icon: '🛕', title: { en: 'Mandir Suraksha', hi: 'मंदिर सुरक्षा' }, desc: { en: 'Preservation and protection of temples and sacred sites', hi: 'मंदिरों और पवित्र स्थलों का संरक्षण और सुरक्षा' } },
  { icon: '🤝', title: { en: 'Hindu Sangathan', hi: 'हिन्दू संगठन' }, desc: { en: 'Uniting Hindu society for collective strength and progress', hi: 'सामूहिक शक्ति और प्रगति के लिए हिन्दू समाज को एकजुट करना' } },
  { icon: '💛', title: { en: 'Seva & Samajseva', hi: 'सेवा एवं समाजसेवा' }, desc: { en: 'Community service and social welfare for the upliftment of all', hi: 'सभी के उत्थान के लिए सामुदायिक सेवा और समाज कल्याण' } },
];

const FocusSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'hsl(var(--navy))' }}>
      {/* Decorative mandala */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MandalaBg className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] text-white opacity-[0.04]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 scroll-reveal">
          <span className="text-xs text-saffron-light font-bold uppercase tracking-widest font-body">
            <EditableText
              cmsKeyEn="focus:label:text_en" cmsKeyHi="focus:label:text_hi"
              fallbackEn="Our Focus" fallbackHi="हमारा ध्येय"
            />
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
            <EditableText
              cmsKeyEn="focus:heading:text_en" cmsKeyHi="focus:heading:text_hi"
              fallbackEn="Areas of Commitment" fallbackHi="प्रतिबद्धता के क्षेत्र"
            />
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 scroll-reveal">
          {focusAreas.map((area) => (
            <div
              key={area.icon}
              className="rounded-xl p-7 transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,107,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <span className="text-[32px]">{area.icon}</span>
              <h3 className="text-[15px] font-bold text-white mt-3 font-display">{t(area.title.en, area.title.hi)}</h3>
              <p className="text-xs text-saffron-light font-hindi mt-0.5">{t(area.title.hi, area.title.en)}</p>
              <p className="text-xs text-white/55 mt-2 font-body leading-relaxed">{t(area.desc.en, area.desc.hi)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FocusSection;
