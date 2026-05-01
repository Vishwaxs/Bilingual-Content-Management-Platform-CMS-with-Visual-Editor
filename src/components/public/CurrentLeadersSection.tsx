import { useLanguage } from '@/contexts/LanguageContext';
import { useReveal } from '@/hooks/useReveal';
import { useLeadershipProfiles } from '@/hooks/useLeadership';
import { useLeadershipContactPhones } from '@/hooks/useSiteSettings';
import { glass } from '@/lib/glass';
import { Crown } from 'lucide-react';

type LeaderRoleKey = 'national' | 'secretary' | 'office';

type LeaderCardData = {
  id: string;
  name_en: string;
  name_hi: string;
  role_en: string;
  role_hi: string;
  role_full_en: string;
  role_full_hi: string;
  initials: string;
  role_key: LeaderRoleKey;
};

const FALLBACK_LEADERS: LeaderCardData[] = [
  {
    id: 'sunil-kumar',
    name_en: 'Sunil Kumar',
    name_hi: 'सुनील कुमार',
    role_en: 'Rashtriya Mahamantri',
    role_hi: 'राष्ट्रीय महामंत्री',
    role_full_en: 'National General Secretary',
    role_full_hi: 'राष्ट्रीय महामंत्री',
    initials: 'SK',
    role_key: 'secretary',
  },
  {
    id: 'munna-kumar-sharma',
    name_en: 'Munna Kumar Sharma',
    name_hi: 'मुन्ना कुमार शर्मा',
    role_en: 'Rashtriya Adhyaksh',
    role_hi: 'राष्ट्रीय अध्यक्ष',
    role_full_en: 'National President',
    role_full_hi: 'राष्ट्रीय अध्यक्ष',
    initials: 'MKS',
    role_key: 'national',
  },
  {
    id: 'veeresh-kumar-tyagi',
    name_en: 'Veeresh Kumar Tyagi',
    name_hi: 'वीरेश कुमार त्यागी',
    role_en: 'Rashtriya Karyalay Mantri',
    role_hi: 'राष्ट्रीय कार्यालय मंत्री',
    role_full_en: 'National Office Secretary',
    role_full_hi: 'राष्ट्रीय कार्यालय मंत्री',
    initials: 'VKT',
    role_key: 'office',
  },
];

const ROLE_ORDER: Record<LeaderRoleKey, number> = {
  secretary: 1,
  national: 2,
  office: 3,
};

const inferRoleKey = (designationEn: string, designationHi: string): LeaderRoleKey | null => {
  const en = designationEn.toLowerCase();
  const hi = designationHi.toLowerCase();
  if (en.includes('president') || en.includes('adhyaksh') || hi.includes('अध्यक्ष')) return 'national';
  if (en.includes('general secretary') || en.includes('mahamantri') || hi.includes('महामंत्री')) return 'secretary';
  if (en.includes('office secretary') || en.includes('karyalay') || hi.includes('कार्यालय')) return 'office';
  return null;
};

const getInitials = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const initials = words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
  return initials || 'ABH';
};

const CurrentLeadersSection = () => {
  const { t, language } = useLanguage();
  const { ref, revealed } = useReveal();
  const { data: cmsLeaders } = useLeadershipProfiles(true);
  const phones = useLeadershipContactPhones();

  const leadersFromCms: LeaderCardData[] = (cmsLeaders || [])
    .map((leader) => {
      const roleKey = inferRoleKey(leader.designation_en, leader.designation_hi);
      if (!roleKey) return null;
      return {
        id: leader.id,
        name_en: leader.name_en,
        name_hi: leader.name_hi,
        role_en: leader.designation_en,
        role_hi: leader.designation_hi,
        role_full_en: leader.designation_en,
        role_full_hi: leader.designation_hi,
        initials: getInitials(leader.name_en),
        role_key: roleKey,
      };
    })
    .filter((leader): leader is LeaderCardData => Boolean(leader))
    .sort((a, b) => ROLE_ORDER[a.role_key] - ROLE_ORDER[b.role_key]);

  const leaders = leadersFromCms.length >= 3 ? leadersFromCms.slice(0, 3) : FALLBACK_LEADERS;

  const phoneByRole: Record<LeaderRoleKey, string> = {
    national: phones.national,
    secretary: phones.secretary,
    office: phones.office,
  };

  return (
    <section
      ref={ref}
      className={`py-20 transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #122B52 50%, #0B1F3A 100%)' }}
    >
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-8 h-[2px]" style={{ background: '#C9942A' }} />
            <span className="text-xs font-bold tracking-[.1em] uppercase" style={{ color: '#C9942A' }}>
              {t('ABHM NATIONAL EXECUTIVE', 'ABHM राष्ट्रीय कार्यकारिणी')}
            </span>
            <div className="w-8 h-[2px]" style={{ background: '#C9942A' }} />
          </div>
          <h2 className="font-display font-black text-white text-3xl lg:text-[42px] leading-[1.15]">
            {t('Current National Leadership', 'वर्तमान राष्ट्रीय नेतृत्व')}
          </h2>
        </div>

        {/* Leader cards */}
        <div className="grid grid-cols-1 sm:gap-4 md:grid-cols-3 md:gap-6 gap-3 max-w-4xl mx-auto">
          {leaders.map((leader) => {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const scaleValue = leader.role_key === 'national'
              ? isMobile ? 'scale(1.01)' : 'scale(1.05)'
              : 'scale(1)';

            return (
            <div
              key={leader.id}
              className="relative text-center overflow-hidden"
              style={{
                ...glass.dark,
                borderRadius: '20px',
                padding: isMobile ? '16px 12px' : 'calc(24px + (32 - 24) * ((100vw - 640px) / (1024 - 640))) calc(18px + (24 - 18) * ((100vw - 640px) / (1024 - 640)))',
                transform: scaleValue,
                border: leader.role_key === 'national'
                  ? '2px solid rgba(255,107,0,0.4)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: leader.role_key === 'national'
                  ? '0 0 40px rgba(255,107,0,0.15), 0 8px 32px rgba(0, 0, 0, 0.25)'
                  : '0 8px 32px rgba(0, 0, 0, 0.25)',
              }}
            >
              {/* Decorative corner glow */}
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{
                background: 'radial-gradient(circle, rgba(255,107,0,0.15), transparent 70%)',
                borderRadius: '0 20px 0 100%',
              }} />

              {/* Crown for president */}
              {leader.role_key === 'national' && (
                <div className="flex justify-center mb-3">
                  <Crown className="w-6 h-6" style={{ color: '#F5C842' }} />
                </div>
              )}

              {/* Initials avatar */}
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center font-display text-2xl font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #FF6B00, #FF9933)',
                  border: '3px solid rgba(255,153,51,0.5)',
                  boxShadow: '0 0 0 4px rgba(255,107,0,0.15)',
                }}
              >
                {leader.initials}
              </div>

              {/* Role badge */}
              <div className="mt-4">
                <span className="inline-block text-xs sm:text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-full"
                  style={{
                    background: 'rgba(255,107,0,0.2)',
                    border: '1px solid rgba(255,107,0,0.4)',
                    color: '#FF9933',
                  }}
                >
                  {language === 'en' ? leader.role_full_en : leader.role_full_hi}
                </span>
                <div className="font-devanagari text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {language === 'en' ? leader.role_hi : leader.role_en}
                </div>
              </div>

              {/* Name */}
              <div className="font-display font-bold text-white text-lg mt-3">
                {language === 'en' ? leader.name_en : leader.name_hi}
              </div>
              <div className="font-devanagari text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {language === 'en' ? leader.name_hi : leader.name_en}
              </div>

              {/* Phone — clickable tel: link */}
              {phoneByRole[leader.role_key] ? (
                <a
                  href={`tel:${phoneByRole[leader.role_key].replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center justify-center mt-4 text-sm font-mono transition-colors hover:text-white min-h-10 min-w-10 px-2"
                  style={{ color: '#FF9933' }}
                >
                  📞 {phoneByRole[leader.role_key]}
                </a>
              ) : (
                <span className="inline-block mt-4 text-xs font-body" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {t('Phone available on request', 'फ़ोन अनुरोध पर उपलब्ध')}
                </span>
              )}

              {/* Divider */}
              <div className="mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
};

export default CurrentLeadersSection;
