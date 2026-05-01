import { useLanguage } from '@/contexts/LanguageContext';
import { EditableText } from '@/components/editor/EditableElement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UP_DISTRICTS } from '@/lib/design-tokens';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { sanitizeText } from '@/lib/security/sanitize';
import { membershipSchema } from '@/lib/security/validate';
import { useState } from 'react';
import { submitMembership } from '@/lib/api';
import { toast } from 'sonner';
import { Phone, Mail, MapPin } from 'lucide-react';
import { usePublicContactInfo } from '@/hooks/useSiteSettings';

const JoinSection = () => {
  const { t } = useLanguage();
  const { phone, email } = usePublicContactInfo();

  const hasDialablePhone = /^[+\d][\d\s-]{8,}$/.test(phone);
  const phoneHref = hasDialablePhone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined;
  const emailHref = `mailto:${email}`;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', district: '', message: '', honeypot: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.honeypot) return;

    const rl = checkRateLimit({ key: 'membership-join', limit: 3, windowMs: 60_000 });
    if (!rl.allowed) {
      toast.error(rl.message || t('Too many attempts. Please wait.', 'बहुत अधिक प्रयास। कृपया प्रतीक्षा करें।'));
      return;
    }

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

    setLoading(true);
    try {
      const payload = {
        ...parsed.data,
        message: sanitizeText(form.message, 500),
      };

      const result = await submitMembership(payload);
      if (result.success) {
        setSubmitted(true);
        toast.success(t('Application submitted successfully!', 'आवेदन सफलतापूर्वक जमा हो गया!'));
        setForm({ full_name: '', phone: '', email: '', district: '', message: '', honeypot: '' });
      } else {
        toast.error(result.error || t('Submission failed. Please try again.', 'सबमिशन विफल। कृपया पुनः प्रयास करें।'));
      }
    } catch {
      toast.error(t('Network error. Please try again.', 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20" style={{ background: 'linear-gradient(135deg, hsl(var(--saffron)) 0%, #E55A00 100%)' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-start">
          {/* Left — Info */}
          <div className="text-white space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              <EditableText
                cmsKeyEn="join:heading:text_en" cmsKeyHi="join:heading:text_hi"
                fallbackEn="Join the Mahasabha" fallbackHi="महासभा से जुड़ें"
              />
            </h2>
            <p className="text-white/80 font-body leading-relaxed max-w-md">
              <EditableText
                cmsKeyEn="join:body:text_en" cmsKeyHi="join:body:text_hi"
                fallbackEn="Become a member of the Akhil Bharat Hindu Mahasabha, Uttar Pradesh unit, and contribute to the mission of cultural preservation and national service."
                fallbackHi="अखिल भारत हिन्दू महासभा, उत्तर प्रदेश इकाई के सदस्य बनें और सांस्कृतिक संरक्षण और राष्ट्रीय सेवा के मिशन में योगदान करें।"
              />
            </p>
            <div className="space-y-3 text-white/90 text-sm font-body">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                {phoneHref ? (
                  <a href={phoneHref} className="hover:text-white transition-colors">{phone}</a>
                ) : (
                  <span>{phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <a href={emailHref} className="hover:text-white transition-colors">{email}</a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <span>{t('ABHM Bhawan, Hazratganj, Lucknow', 'ABHM भवन, हज़रतगंज, लखनऊ')}</span>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div
            className="rounded-xl p-4 sm:p-6 md:p-8"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 22px 56px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-bold text-lg text-[#0B1F3A]">{t('Application Received!', 'आवेदन प्राप्त!')}</h3>
                <p className="text-sm text-gray-500 mt-2">{t('We will contact you shortly.', 'हम जल्द ही आपसे संपर्क करेंगे।')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
                  {t('Membership Application', 'सदस्यता आवेदन')}
                </h3>
                <Input
                  placeholder={t('Full Name *', 'पूरा नाम *')}
                  value={form.full_name}
                  onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                  required
                  className="text-sm sm:text-base"
                />
                <Input
                  placeholder={t('Phone *', 'फ़ोन *')}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  autoComplete="tel-national"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                  className="text-sm sm:text-base"
                />
                <Input
                  placeholder={t('Email (optional)', 'ईमेल (वैकल्पिक)')}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="text-sm sm:text-base"
                />
                <Select value={form.district} onValueChange={(v) => setForm(f => ({ ...f, district: v }))}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder={t('Select District *', 'ज़िला चुनें *')} />
                  </SelectTrigger>
                  <SelectContent>
                    {UP_DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d} className="text-sm sm:text-base">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder={t('Message (optional)', 'संदेश (वैकल्पिक)')}
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  maxLength={500}
                  rows={2}
                  className="text-sm sm:text-base"
                />
                <input
                  type="text"
                  name="honeypot"
                  value={form.honeypot}
                  onChange={(e) => setForm(f => ({ ...f, honeypot: e.target.value }))}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ opacity: 0, position: 'absolute', left: '-9999px', height: 0, width: 0 }}
                />
                <Button type="submit" disabled={loading} className="w-full bg-saffron hover:bg-saffron/90 text-white font-body">
                  {loading ? t('Submitting...', 'जमा हो रहा है...') : t('Submit Application', 'आवेदन जमा करें')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
