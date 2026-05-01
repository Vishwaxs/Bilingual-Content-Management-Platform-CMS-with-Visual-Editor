import { useLanguage } from '@/contexts/LanguageContext';
import { EditableText } from '@/components/editor/EditableElement';
import { translations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const CTASection = () => {
  const { t } = useLanguage();
  const { ref, revealed } = useReveal();

  return (
    <section
      ref={ref}
      className={`py-20 bg-secondary text-secondary-foreground transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          <EditableText
            cmsKeyEn="cta:heading:text_en" cmsKeyHi="cta:heading:text_hi"
            fallbackEn={translations.cta.title.en} fallbackHi={translations.cta.title.hi}
          />
        </h2>
        <p className="text-base sm:text-lg opacity-80 mb-8 max-w-xl mx-auto font-body">
          <EditableText
            cmsKeyEn="cta:subheading:text_en" cmsKeyHi="cta:subheading:text_hi"
            fallbackEn={translations.cta.subtitle.en} fallbackHi={translations.cta.subtitle.hi}
          />
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="font-body text-base">
            {t(translations.cta.joinBtn.en, translations.cta.joinBtn.hi)}
          </Button>
          <Button variant="outline" size="lg" className="font-body text-base border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
            {t(translations.cta.contactBtn.en, translations.cta.contactBtn.hi)}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
