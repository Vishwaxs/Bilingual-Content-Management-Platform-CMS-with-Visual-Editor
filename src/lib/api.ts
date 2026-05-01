// src/lib/api.ts — Client-side API callers for Edge Functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

const CONFIG_ERROR_MESSAGE = 'Service configuration missing. Please contact support.';

const DEFAULT_TIMEOUT_MS = 15_000;

const fetchWithTimeout = async (input: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const readJsonSafely = async (res: Response): Promise<Record<string, unknown> | null> => {
  try {
    const parsed = await res.json();
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
};

const extractErrorMessage = (payload: Record<string, unknown> | null, fallback: string) => {
  if (!payload) return fallback;
  if (typeof payload.error === 'string' && payload.error.trim().length > 0) return payload.error;
  if (typeof payload.message === 'string' && payload.message.trim().length > 0) return payload.message;
  return fallback;
};

export async function submitContact(data: {
  name: string; email?: string; phone?: string; message: string; district?: string; honeypot?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { success: false, error: CONFIG_ERROR_MESSAGE };
  }

  try {
    const res = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ ...data, honeypot: data.honeypot ?? '' }),
    });

    const payload = await readJsonSafely(res);

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(payload, `Request failed (${res.status})`),
      };
    }

    return {
      success: true,
      message: typeof payload?.message === 'string' ? payload.message : undefined,
    };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'Request timed out. Please try again.'
      : 'Network error. Please try again.';
    return { success: false, error: message };
  }
}

export async function submitMembership(data: {
  full_name: string; email?: string;
  phone: string; district: string; message?: string; honeypot?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { success: false, error: CONFIG_ERROR_MESSAGE };
  }

  try {
    const res = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/membership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
      body: JSON.stringify({ ...data, honeypot: data.honeypot ?? '' }),
    });

    const payload = await readJsonSafely(res);

    if (!res.ok) {
      return {
        success: false,
        error: extractErrorMessage(payload, `Request failed (${res.status})`),
      };
    }

    return {
      success: true,
      message: typeof payload?.message === 'string' ? payload.message : undefined,
    };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'Request timed out. Please try again.'
      : 'Network error. Please try again.';
    return { success: false, error: message };
  }
}

export async function uploadFile(
  file: File,
  bucket: 'news-images' | 'event-images' | 'leader-photos' | 'documents' | 'media',
  authToken: string
): Promise<{ url: string; path: string; size?: number; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { url: '', path: '', error: CONFIG_ERROR_MESSAGE };
  }

  try {
    const form = new FormData();
    form.append('file', file);

    const res = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/upload?bucket=${bucket}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_KEY,
      },
      body: form,
    }, 30_000);

    const payload = await readJsonSafely(res);

    if (!res.ok) {
      return {
        url: '',
        path: '',
        error: extractErrorMessage(payload, `Upload failed (${res.status})`),
      };
    }

    const url = typeof payload?.url === 'string' ? payload.url : '';
    const path = typeof payload?.path === 'string' ? payload.path : '';

    if (!url || !path) {
      return {
        url: '',
        path: '',
        error: extractErrorMessage(payload, 'Upload returned an invalid response.'),
      };
    }

    return {
      url,
      path,
      size: typeof payload?.size === 'number' ? payload.size : undefined,
      error: typeof payload?.error === 'string' ? payload.error : undefined,
    };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'Upload timed out. Please try again.'
      : 'Network error during upload. Please try again.';
    return { url: '', path: '', error: message };
  }
}
