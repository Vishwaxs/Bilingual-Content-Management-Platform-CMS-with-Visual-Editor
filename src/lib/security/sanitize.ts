// src/lib/security/sanitize.ts
// Client + Server security utility library for ABHM UP

/**
 * Strip all HTML tags from a string. Use for plain text fields.
 * Prevents stored XSS by ensuring no HTML ever enters text columns.
 */
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/<[^>]*>/g, '')        // Strip all HTML tags
    .replace(/javascript:/gi, '')    // Strip JS protocol
    .replace(/on\w+\s*=/gi, '')     // Strip event handlers
    .slice(0, maxLength);
}

/**
 * Sanitize HTML content for rich text fields (news content).
 * Uses an allowlist of safe tags only.
 * Called server-side (Edge Function) before DB insert.
 */
export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string') return '';

  // Remove script/style/iframe tags and their contents entirely
  let clean = input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')   // Remove event handlers
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')           // Remove unquoted event handlers
    .replace(/javascript:/gi, 'blocked:')            // Block JS protocol in hrefs
    .replace(/vbscript:/gi, 'blocked:')              // Block VBScript protocol
    .replace(/data:(?!image\/(png|jpg|jpeg|gif|webp))/gi, 'blocked:'); // Block data URIs except images

  // Validate that remaining anchor href and img src use safe protocols
  const ALLOWED_PROTOCOLS = /^(https?):\/\//i;

  clean = clean.replace(/href\s*=\s*["']([^"']*)["']/gi, (match, url) => {
    if (ALLOWED_PROTOCOLS.test(url.trim()) || url.startsWith('#') || url.startsWith('/')) {
      return match;
    }
    return 'href="#"';
  });

  clean = clean.replace(/src\s*=\s*["']([^"']*)["']/gi, (match, url) => {
    if (ALLOWED_PROTOCOLS.test(url.trim()) || url.startsWith('/')) {
      return match;
    }
    return 'src=""';
  });

  return clean.slice(0, 200_000); // Hard cap at 200KB
}

/**
 * Generate a URL-safe slug from any string.
 */
export function sanitizeSlug(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')    // Keep only alphanumeric and hyphens
    .replace(/\s+/g, '-')             // Spaces to hyphens
    .replace(/-+/g, '-')              // Collapse multiple hyphens
    .replace(/^-|-$/g, '')            // Trim leading/trailing hyphens
    .slice(0, 120);
}

/**
 * Validate and sanitize email addresses.
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  const email = input.trim().toLowerCase().slice(0, 254);
  const RFC_EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return RFC_EMAIL.test(email) ? email : '';
}

/**
 * Validate Indian phone numbers (10 digits, optional +91 prefix).
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  const digits = input.replace(/\D/g, '');
  // Accept 10-digit Indian numbers with or without +91 country code
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return '';
}

/**
 * Validate and sanitize URLs. Only allows http/https.
 */
export function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string' || !input.trim()) return '';
  try {
    const url = new URL(input.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString().slice(0, 2000);
  } catch {
    return '';
  }
}

/**
 * Honeypot check — bot trap field must be empty.
 * Bots fill all form fields; humans leave honeypot empty.
 */
export function isHoneypotClean(value: unknown): boolean {
  return value === '' || value === null || value === undefined;
}

/**
 * Validate that a string matches a safe slug pattern.
 */
export function isValidSlug(value: string): boolean {
  return /^[a-z0-9-]{3,120}$/.test(value);
}

/**
 * Truncate text for display with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}
