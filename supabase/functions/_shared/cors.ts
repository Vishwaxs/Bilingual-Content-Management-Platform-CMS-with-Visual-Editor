const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];

const resolveAllowedOrigins = () => {
  const envOrigins = (Deno.env.get('CORS_ALLOWED_ORIGINS') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return envOrigins.length > 0 ? envOrigins : DEFAULT_ALLOWED_ORIGINS;
};

const allowedOrigins = resolveAllowedOrigins();

export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin')?.trim() || '';
  const allowOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  return null;
}

export function jsonResponse(req: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}
