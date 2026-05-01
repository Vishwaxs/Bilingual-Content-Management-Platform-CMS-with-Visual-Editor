import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUpcomingEvents, usePastEvents } from '@/hooks/useEvents';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

type EventRowData = {
  id: string;
  slug?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  title_en: string;
  title_hi?: string | null;
  location_en?: string | null;
  location_hi?: string | null;
};

const EventsPage = () => {
  const { t, language } = useLanguage();
  const { data: upcoming, isLoading } = useUpcomingEvents();
  const { data: past } = usePastEvents(10);
  const [showPast, setShowPast] = useState(false);

  const EventRow = ({ evt, isPast }: { evt: EventRowData; isPast?: boolean }) => {
    const date = evt.event_date ? new Date(evt.event_date) : null;
    return (
      <Link to={evt.slug ? `/events/${evt.slug}` : '#'}
        className="grid grid-cols-[72px_1fr_auto] gap-5 border border-black/[0.08] rounded-lg p-5 items-center hover:border-[rgba(255,107,0,0.25)] hover:shadow-md transition-all">
        <div className={`border rounded-lg text-center px-1.5 py-2.5 ${isPast ? 'bg-gray-100 border-gray-200' : 'bg-[#FFF4E6] border-[rgba(255,107,0,0.2)]'}`}>
          <div className={`font-display text-2xl font-black leading-none ${isPast ? 'text-gray-400' : 'text-[#FF6B00]'}`}>{date ? format(date, 'd') : '?'}</div>
          <div className="text-[10px] font-bold text-gray-500 tracking-[.04em] mt-0.5">{date ? format(date, 'MMM').toUpperCase() : 'TBA'}</div>
        </div>
        <div>
          <div className="font-bold text-[15px] text-[#0B1F3A] mb-0.5">{language === 'en' ? evt.title_en : (evt.title_hi || evt.title_en)}</div>
          <div className="flex gap-2 flex-wrap mt-1">
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
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}>
          {isPast ? t('Past', 'बीत गया') : t('Upcoming', 'आगामी')}
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-[#0B1F3A] py-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80">{t('Home', 'मुखपृष्ठ')}</Link><span>›</span>
            <span className="text-white/80">{t('Events', 'कार्यक्रम')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white">{t('Events', 'कार्यक्रम')}</h1>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-black text-[#0B1F3A] text-2xl mb-6">{t('Upcoming Events', 'आगामी कार्यक्रम')}</h2>
          {isLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : upcoming && upcoming.length > 0 ? (
            <div className="flex flex-col gap-4">{upcoming.map(evt => <EventRow key={evt.id} evt={evt} />)}</div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-[rgba(255,107,0,0.3)] rounded-xl">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-lg font-semibold text-[#0B1F3A]">{t('No upcoming events', 'कोई आगामी कार्यक्रम नहीं')}</div>
            </div>
          )}

          {/* Past events */}
          {past && past.length > 0 && (
            <div className="mt-12">
              <button onClick={() => setShowPast(!showPast)}
                className="text-sm font-semibold text-[#FF6B00] hover:underline mb-4">
                {showPast ? t('Hide past events ▲', 'पिछले कार्यक्रम छुपाएं ▲') : t('Show past events ▼', 'पिछले कार्यक्रम दिखाएं ▼')}
              </button>
              {showPast && (
                <div className="flex flex-col gap-4 mt-4">{past.map(evt => <EventRow key={evt.id} evt={evt} isPast />)}</div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EventsPage;
