import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCors, jsonResponse } from '../_shared/cors.ts';
import { getClientAddress, rateLimit } from '../_shared/rate-limit.ts';
import { sanitizeText, sanitizeEmail, sanitizePhone, isHoneypotClean } from '../_shared/sanitize.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') return jsonResponse(req, { error: 'Method not allowed' }, 405);

  // Server-side rate limit: 5 submissions per 60 seconds per IP
  const clientIp = getClientAddress(req);
  const rl = await rateLimit(`contact:${clientIp}`, 5, 60);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }), {
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

  // Honeypot check — silent success for bots
  if (!isHoneypotClean(body.honeypot)) {
    return jsonResponse(req, { success: true, message: 'Thank you for your message.' });
  }

  // Validate required fields
  const name = sanitizeText(body.name, 100);
  const message = sanitizeText(body.message, 2000);
  if (name.length < 2) return jsonResponse(req, { error: 'Name must be at least 2 characters', field: 'name' }, 422);
  if (message.length < 10) return jsonResponse(req, { error: 'Message must be at least 10 characters', field: 'message' }, 422);

  const email = body.email ? sanitizeEmail(body.email) : null;
  if (body.email && !email) return jsonResponse(req, { error: 'Invalid email address', field: 'email' }, 422);

  const phone = body.phone ? sanitizePhone(body.phone) : null;

  // Insert using service role to bypass RLS on this table
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error } = await supabase.from('contact_submissions').insert({
    name,
    email,
    phone,
    message,
  });

  if (error) {
    console.error('Contact insert error:', error.code, error.message);
    return jsonResponse(req, { error: 'Failed to submit. Please try again.' }, 500);
  }

  return jsonResponse(req, { success: true, message: 'Your message has been received. We will contact you shortly.' });
});
