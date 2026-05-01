import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCors, jsonResponse } from '../_shared/cors.ts';
import { getClientAddress, rateLimit } from '../_shared/rate-limit.ts';
import { sanitizeText, sanitizeEmail, sanitizePhone, isHoneypotClean, UP_DISTRICTS } from '../_shared/sanitize.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  const clientIp = getClientAddress(req);
  const rl = await rateLimit(`membership:${clientIp}`, 3, 60);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait before submitting again.' }), {
      status: 429,
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
      },
    });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return jsonResponse(req, { error: 'Invalid request body' }, 400);
  }

  if (!isHoneypotClean(body.honeypot)) {
    return jsonResponse(req, { success: true, message: 'Application received.' });
  }

  const full_name = sanitizeText(body.full_name, 100);
  if (full_name.length < 3) return jsonResponse(req, { error: 'Full name is required', field: 'full_name' }, 422);

  const phone = sanitizePhone(body.phone);
  if (!phone) return jsonResponse(req, { error: 'Valid 10-digit mobile number required', field: 'phone' }, 422);

  const district = typeof body.district === 'string' ? body.district : '';
  if (!UP_DISTRICTS.has(district)) return jsonResponse(req, { error: 'Select a valid Uttar Pradesh district', field: 'district' }, 422);

  const email = body.email ? sanitizeEmail(body.email as string) : null;
  const message = body.message ? sanitizeText(body.message, 500) : null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error } = await supabase.from('membership_applications').insert({
    full_name, email, phone, district, message,
  });

  if (error) {
    console.error('Membership insert error:', error.code);
    return jsonResponse(req, { error: 'Submission failed. Please try again.' }, 500);
  }

  return jsonResponse(req, { success: true, message: 'Application received! We will contact you shortly. / आवेदन प्राप्त हुआ! हम जल्द संपर्क करेंगे।' });
});
