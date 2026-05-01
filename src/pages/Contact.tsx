import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { submitContact, submitMembership } from '@/lib/api';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { sanitizeText } from '@/lib/security/sanitize';
import { contactSchema, membershipSchema } from '@/lib/security/validate';
import { UP_DISTRICTS } from '@/lib/design-tokens';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { usePublicContactInfo } from '@/hooks/useSiteSettings';

const ContactPage = () => {
  const { t } = useLanguage();
  const { phone, email } = usePublicContactInfo();

  const hasDialablePhone = /^[+\d][\d\s-]{8,}$/.test(phone);
  const phoneHref = hasDialablePhone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined;
  const emailHref = `mailto:${email}`;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-[#0B1F3A] py-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Link to="/" className="hover:text-white/80">{t('Home', 'मुखपृष्ठ')}</Link><span>›</span>
            <span className="text-white/80">{t('Contact', 'संपर्क')}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white">{t('Contact Us', 'संपर्क करें')}</h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-display font-black text-[#0B1F3A] text-2xl mb-6">{t('Get in Touch', 'संपर्क में रहें')}</h2>
              <div className="space-y-4">
                {[
                  { icon: <MapPin className="w-5 h-5" />, label: t('Address', 'पता'), value: t('ABHM Bhawan, Hazratganj, Lucknow, UP 226001', 'ABHM भवन, हजरतगंज, लखनऊ, उ.प्र. 226001') },
                  { icon: <Phone className="w-5 h-5" />, label: t('Phone', 'फ़ोन'), value: phone, href: phoneHref },
                  { icon: <Mail className="w-5 h-5" />, label: t('Email', 'ईमेल'), value: email, href: emailHref },
                  { icon: <Clock className="w-5 h-5" />, label: t('Hours', 'समय'), value: t('Mon-Sat: 10:00 AM - 6:00 PM', 'सोम-शनि: 10:00 AM - 6:00 PM') },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-[#FFF4E6] text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</div>
                      <div className="text-sm text-[#0B1F3A] mt-0.5">
                        {'href' in item && item.href ? (
                          <a href={item.href} className="hover:text-[#FF6B00] transition-colors">{item.value}</a>
                        ) : (
                          item.value
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Membership Form Section */}
      <section className="py-16 bg-[#F8F6F2]">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display font-black text-[#0B1F3A] text-2xl mb-2 text-center">{t('Join ABHM UP', 'ABHM UP से जुड़ें')}</h2>
          <p className="text-sm text-gray-500 text-center mb-8">{t('Apply for membership in your district', 'अपने जिले में सदस्यता के लिए आवेदन करें')}</p>
          <MembershipForm />
        </div>
      </section>
      <Footer />
    </div>
  );
};

const ContactForm = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', honeypot: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;
    const rl = checkRateLimit({ key: 'contact', limit: 5, windowMs: 60000 });
    if (!rl.allowed) { toast.error(rl.message || 'Too many attempts'); return; }

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || t('Invalid form data', 'अमान्य फ़ॉर्म डेटा'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContact(parsed.data);
      if (res.success) { setDone(true); toast.success(t('Message sent!', 'संदेश भेजा गया!')); }
      else toast.error(res.error || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  if (done) return (
    <div className="bg-[#F8F6F2] rounded-xl p-8 text-center">
      <div className="text-4xl mb-3">✅</div>
      <h3 className="font-bold text-[#0B1F3A] text-lg">{t('Message Received!', 'संदेश प्राप्त!')}</h3>
      <p className="text-sm text-gray-500 mt-2">{t('We will contact you shortly.', 'हम जल्द संपर्क करेंगे।')}</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-[#F8F6F2] rounded-xl p-8 space-y-4">
      <h3 className="font-bold text-[#0B1F3A] text-lg mb-4">{t('Send a Message', 'संदेश भेजें')}</h3>
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('Name *', 'नाम *')}</label>
        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] outline-none" required maxLength={100} autoComplete="name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('Email', 'ईमेल')}</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] outline-none" maxLength={200} autoComplete="email" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('Phone', 'फ़ोन')}</label>
          <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] outline-none"
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            inputMode="numeric"
            autoComplete="tel-national" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('Message *', 'संदेश *')}</label>
        <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] outline-none resize-none"
          required
          minLength={10}
          maxLength={2000} />
      </div>
      <input type="text" name="honeypot" value={form.honeypot} onChange={e => setForm(p => ({ ...p, honeypot: e.target.value }))}
        tabIndex={-1} autoComplete="off" style={{ opacity: 0, position: 'absolute', left: '-9999px', height: 0, width: 0 }} />
      <button type="submit" disabled={submitting}
        className="w-full bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold py-3 rounded-md transition-all disabled:opacity-50">
        {submitting ? t('Sending...', 'भेज रहे हैं...') : t('Send Message', 'संदेश भेजें')}
      </button>
    </form>
  );
};

const MembershipForm = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', district: '', message: '', honeypot: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;
    const rl = checkRateLimit({ key: 'membership-contact', limit: 3, windowMs: 60000 });
    if (!rl.allowed) { toast.error(rl.message || 'Too many attempts'); return; }

    const parsed = membershipSchema.safeParse({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      district: form.district,
      honeypot: form.honeypot,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || t('Invalid form data', 'अमान्य फ़ॉर्म डेटा'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitMembership({
        ...parsed.data,
        message: sanitizeText(form.message, 500),
      });
      if (res.success) { setDone(true); toast.success(t('Application submitted!', 'आवेदन जमा!')); }
      else toast.error(res.error || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  if (done) return (
    <div className="bg-white rounded-xl p-8 text-center">
      <div className="text-4xl mb-3">✅</div>
      <h3 className="font-bold text-[#0B1F3A] text-lg">{t('Application Received!', 'आवेदन प्राप्त!')}</h3>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 space-y-4 border border-black/[0.06]">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('Full Name *', 'पूरा नाम *')}</label>
          <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] outline-none" required maxLength={100} autoComplete="name" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('Phone *', 'फ़ोन *')}</label>
          <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] outline-none"
            required
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            inputMode="numeric"
            autoComplete="tel-national" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('Email (optional)', 'ईमेल')}</label>
        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] outline-none" maxLength={200} autoComplete="email" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('District *', 'जिला *')}</label>
        <select value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#FF6B00] outline-none bg-white" required>
          <option value="">{t('Select District', 'जिला चुनें')}</option>
          {UP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <input type="text" name="honeypot" value={form.honeypot} onChange={e => setForm(p => ({ ...p, honeypot: e.target.value }))}
        tabIndex={-1} autoComplete="off" style={{ opacity: 0, position: 'absolute', left: '-9999px', height: 0, width: 0 }} />
      <button type="submit" disabled={submitting}
        className="w-full bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold py-3 rounded-md transition-all disabled:opacity-50">
        {submitting ? t('Submitting...', 'जमा हो रहा...') : t('Submit Application', 'आवेदन जमा करें')}
      </button>
    </form>
  );
};

export default ContactPage;
