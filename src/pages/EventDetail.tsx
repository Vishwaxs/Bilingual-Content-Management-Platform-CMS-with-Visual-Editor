import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEventBySlug } from '@/hooks/useEvents';
import { useSubmitRsvp, useRsvpCount } from '@/hooks/useEventRsvps';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Calendar, ExternalLink, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { EventPhotoGallery } from '@/components/public/EventPhotoGallery';

const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const { data: event, isLoading, error } = useEventBySlug(slug || '');
  const submitRsvp = useSubmitRsvp();
  const { data: rsvpCount } = useRsvpCount(event?.id || '');
  const [rsvpForm, setRsvpForm] = useState({ name: '', phone: '', district: '', attendees: '1' });
  const [rsvpDone, setRsvpDone] = useState(false);

  const generateICS = () => {
    if (!event?.event_date) return;
    const d = new Date(event.event_date);
    const ymd = format(d, "yyyyMMdd");
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:${ymd}\nSUMMARY:${event.title_en}\nLOCATION:${event.location_en || ''}\nDESCRIPTION:ABHM UP Event\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${event.slug || 'event'}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="min-h-screen"><SiteHeader /><div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full" /></div></div>;
  if (error || !event) return (
    <div className="min-h-screen"><SiteHeader /><div className="container mx-auto px-4 py-20 text-center">
      <div className="text-4xl mb-4">📅</div><h1 className="font-display text-2xl font-bold text-[#0B1F3A]">{t('Event Not Found', 'कार्यक्रम नहीं मिला')}</h1>
      <Link to="/events" className="text-[#FF6B00] text-sm mt-4 inline-block">{t('← Back to Events', '← कार्यक्रम पर वापस')}</Link>
    </div><Footer /></div>
  );

  const date = event.event_date ? new Date(event.event_date) : null;
  const content = sanitizeHtml(language === 'hi' && event.description_hi ? event.description_hi : event.description_en);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-[#0B1F3A] py-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80">{t('Home', 'मुखपृष्ठ')}</Link><span>›</span>
            <Link to="/events" className="hover:text-white/80">{t('Events', 'कार्यक्रम')}</Link><span>›</span>
            <span className="text-white/80 truncate max-w-[200px]">{language === 'en' ? event.title_en : event.title_hi}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white">{language === 'en' ? event.title_en : (event.title_hi || event.title_en)}</h1>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Event meta */}
          <div className="flex flex-wrap gap-6 mb-8 p-6 bg-[#F8F6F2] rounded-xl">
            {date && (
              <div className="flex items-center gap-3">
                <div className="bg-[#FF6B00] text-white px-4 py-3 rounded-lg text-center">
                  <div className="font-display text-2xl font-black leading-none">{format(date, 'd')}</div>
                  <div className="text-[10px] font-bold tracking-wider mt-0.5">{format(date, 'MMM yyyy').toUpperCase()}</div>
                </div>
                <div><div className="text-sm font-semibold text-[#0B1F3A]">{format(date, 'EEEE')}</div><div className="text-xs text-gray-500">{format(date, 'MMMM d, yyyy')}</div></div>
              </div>
            )}
            {event.event_time && <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4 text-[#FF6B00]" /> {event.event_time}</div>}
            {event.location_en && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(event.location_en)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#FF6B00] transition-colors">
                <MapPin className="w-4 h-4 text-[#FF6B00]" /> {language === 'en' ? event.location_en : (event.location_hi || event.location_en)} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button onClick={generateICS} className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#E55A00] transition-all flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {t('Add to Calendar', 'कैलेंडर में जोड़ें')}
            </button>
          </div>

          {/* Cover image */}
          {event.cover_image && <img src={event.cover_image} alt={event.title_en} className="w-full rounded-xl mb-8" />}

          {/* Description */}
          <div className="prose prose-lg prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

          {/* Photo Gallery */}
          <EventPhotoGallery eventId={event.id} />

          {/* RSVP Section */}
          {date && date.getTime() > Date.now() && (
            <div className="mt-12 p-8 bg-gradient-to-br from-[#FFF8F2] to-[#FFF4E6] rounded-xl border border-[#FF6B00]/15">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#FF6B00]" />
                <h2 className="font-display text-xl font-bold text-[#0B1F3A]">
                  {t('RSVP / Register', 'पंजीकरण करें')}
                </h2>
                {(rsvpCount ?? 0) > 0 && (
                  <span className="text-xs font-semibold text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-0.5 rounded-full">
                    {rsvpCount} {t('registered', 'पंजीकृत')}
                  </span>
                )}
              </div>

              {rsvpDone ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-[#0B1F3A]">
                    {t('Your registration is confirmed. See you there!', 'आपका पंजीकरण पक्का हो गया। वहाँ मिलते हैं!')}
                  </p>
                </div>
              ) : (
                <form
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!event?.id) return;
                    try {
                      await submitRsvp.mutateAsync({
                        event_id: event.id,
                        name: rsvpForm.name.trim(),
                        phone: rsvpForm.phone.trim(),
                        district: rsvpForm.district.trim() || undefined,
                        attendees_count: parseInt(rsvpForm.attendees) || 1,
                      });
                      setRsvpDone(true);
                      toast.success(t('Registration confirmed!', 'पंजीकरण सफल!'));
                    } catch (err: any) {
                      toast.error(err.message || t('Registration failed', 'पंजीकरण विफल'));
                    }
                  }}
                >
                  <input
                    required
                    placeholder={t('Your Name *', 'आपका नाम *')}
                    value={rsvpForm.name}
                    onChange={(e) => setRsvpForm(p => ({ ...p, name: e.target.value }))}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] transition"
                  />
                  <input
                    required
                    type="tel"
                    pattern="[0-9]{10}"
                    placeholder={t('Phone (10 digits) *', 'फ़ोन (10 अंक) *')}
                    value={rsvpForm.phone}
                    onChange={(e) => setRsvpForm(p => ({ ...p, phone: e.target.value }))}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] transition"
                  />
                  <input
                    placeholder={t('District (optional)', 'जिला (वैकल्पिक)')}
                    value={rsvpForm.district}
                    onChange={(e) => setRsvpForm(p => ({ ...p, district: e.target.value }))}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] transition"
                  />
                  <select
                    value={rsvpForm.attendees}
                    onChange={(e) => setRsvpForm(p => ({ ...p, attendees: e.target.value }))}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] transition bg-white"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n} {t('attendee(s)', 'उपस्थित')}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={submitRsvp.isPending}
                    className="sm:col-span-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    {submitRsvp.isPending
                      ? t('Registering...', 'पंजीकरण हो रहा है...')
                      : t('Register Now', 'अभी पंजीकरण करें')}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EventDetailPage;
