import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-md border border-navy-foreground/20 text-[12px] font-body font-medium text-navy-foreground/80 hover:text-navy-foreground hover:border-navy-foreground/40 transition-all"
    >
      {language === 'en' ? 'हिन्दी' : 'English'}
    </button>
  );
};

export default LanguageToggle;
