import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/i18n';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  title_en: string;
  title_hi: string;
  event_date?: string | null;
  event_time?: string | null;
  location_en?: string | null;
  location_hi?: string | null;
  status: string;
}

interface EventsSectionProps {
  events?: Event[];
}

const EventsSection = ({ events = [] }: EventsSectionProps) => {
  const { t, field } = useLanguage();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 scroll-reveal">
          <span className="text-xs text-saffron font-bold uppercase tracking-widest font-body">
            {t('Stay Updated', 'अपडेट रहें')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
            {t(translations.sections.upcomingEvents.en, translations.sections.upcomingEvents.hi)}
          </h2>
        </div>
        <div className="space-y-4 max-w-3xl mx-auto scroll-reveal">
          {events.length > 0 ? events.map((ev) => (
            <div key={ev.id} className="grid grid-cols-[72px_1fr_auto] gap-5 items-center border border-border rounded-xl p-5 hover:shadow-md transition-shadow bg-card">
              {/* Date block */}
              <div className="bg-saffron-pale rounded-lg flex flex-col items-center justify-center py-2">
                {ev.event_date ? (
                  <>
                    <span className="font-display text-2xl font-bold text-saffron">{format(new Date(ev.event_date), 'd')}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(ev.event_date), 'MMM')}</span>
                  </>
                ) : (
                  <Calendar className="h-6 w-6 text-saffron" />
                )}
              </div>
              {/* Details */}
              <div>
                <h3 className="font-display text-[15px] font-bold text-foreground">{field(ev, 'title')}</h3>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {ev.event_time && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      <Clock className="h-3 w-3" /> {ev.event_time}
                    </span>
                  )}
                  {(ev.location_en || ev.location_hi) && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      <MapPin className="h-3 w-3" /> {field(ev, 'location')}
                    </span>
                  )}
                </div>
              </div>
              {/* Status */}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                ev.status === 'published' ? 'bg-green-flag/10 text-green-flag' : 'bg-saffron/10 text-saffron'
              }`}>
                {t('Upcoming', 'आगामी')}
              </span>
            </div>
          )) : (
            <p className="text-center text-muted-foreground font-body">
              {t('Events coming soon.', 'कार्यक्रम जल्द आ रहे हैं।')}
            </p>
          )}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link to="/events">{t(translations.sections.viewAll.en, translations.sections.viewAll.hi)}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
