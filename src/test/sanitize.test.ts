import { describe, expect, it } from 'vitest';
import {
  sanitizeText,
  sanitizeHtml,
  sanitizeSlug,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  isHoneypotClean,
  isValidSlug,
  truncate,
} from '@/lib/security/sanitize';

/**
 * Unit coverage for the shared sanitization helpers. These run on both
 * client form submissions and server-side Edge Functions before DB
 * inserts, so their behaviour is security-relevant. Prior tests only
 * exercised the zod schemas in validate.ts; the primitives here were
 * uncovered.
 */

describe('sanitizeText', () => {
  it('returns an empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(42)).toBe('');
    expect(sanitizeText({})).toBe('');
  });

  it('strips HTML tags', () => {
    expect(sanitizeText('<b>Hello</b> world')).toBe('Hello world');
  });

  it('drops an element that is entirely markup', () => {
    expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('');
  });

  it('strips the javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)');
  });

  it('strips inline event-handler attributes', () => {
    expect(sanitizeText('onclick=alert(1)')).toBe('alert(1)');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeText('   spaced   ')).toBe('spaced');
  });

  it('enforces the default 500-character cap', () => {
    expect(sanitizeText('a'.repeat(600))).toHaveLength(500);
  });

  it('honours a custom max length', () => {
    expect(sanitizeText('a'.repeat(50), 10)).toHaveLength(10);
  });
});

describe('sanitizeHtml', () => {
  it('returns an empty string for non-string input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(123)).toBe('');
  });

  it('removes script tags and their contents entirely', () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).toContain('<p>ok</p>');
    expect(out).not.toContain('alert(1)');
    expect(out.toLowerCase()).not.toContain('<script');
  });

  it('removes style, iframe, object, embed and form tags', () => {
    const out = sanitizeHtml(
      '<style>x{}</style><iframe src="e"></iframe><object></object><embed src="e"><form></form>keep',
    );
    expect(out).toContain('keep');
    expect(out.toLowerCase()).not.toContain('<style');
    expect(out.toLowerCase()).not.toContain('<iframe');
    expect(out.toLowerCase()).not.toContain('<object');
    expect(out.toLowerCase()).not.toContain('<embed');
    expect(out.toLowerCase()).not.toContain('<form');
  });

  it('strips quoted and unquoted event handlers', () => {
    const out = sanitizeHtml('<p onclick="steal()" onmouseover=go>hi</p>');
    expect(out.toLowerCase()).not.toContain('onclick');
    expect(out.toLowerCase()).not.toContain('onmouseover');
  });

  it('neutralises javascript: and vbscript: protocols', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a><a href="vbscript:msg">y</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
    expect(out.toLowerCase()).not.toContain('vbscript:');
  });

  it('keeps safe http(s) anchor hrefs untouched', () => {
    const out = sanitizeHtml('<a href="https://example.org/page">link</a>');
    expect(out).toContain('href="https://example.org/page"');
  });

  it('rewrites disallowed anchor protocols to a safe placeholder', () => {
    const out = sanitizeHtml('<a href="ftp://example.org/file">x</a>');
    expect(out).toContain('href="#"');
    expect(out).not.toContain('ftp://');
  });

  it('strips every data: URI from image src, keeping only http(s)/relative sources', () => {
    // Note: sanitizeHtml has an early rule that preserves data:image/(png|jpg|…)
    // URIs, but the later src-protocol allowlist only permits http(s) and
    // root-relative URLs — so in practice all data: image srcs are blanked.
    // This test documents that (safe) end-to-end behaviour.
    expect(sanitizeHtml('<img src="data:image/png;base64,AAAA">')).toContain('src=""');
    expect(sanitizeHtml('<img src="data:image/svg+xml,<svg>">')).not.toContain('data:');
    expect(sanitizeHtml('<img src="https://example.org/a.png">')).toContain(
      'src="https://example.org/a.png"',
    );
  });

  it('caps output at 200KB', () => {
    const out = sanitizeHtml('a'.repeat(250_000));
    expect(out.length).toBe(200_000);
  });
});

describe('sanitizeSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(sanitizeSlug('Hello World')).toBe('hello-world');
  });

  it('removes diacritics', () => {
    expect(sanitizeSlug('Café Déjà')).toBe('cafe-deja');
  });

  it('collapses repeated hyphens and trims edge hyphens', () => {
    expect(sanitizeSlug('  --Foo   ---   Bar--  ')).toBe('foo-bar');
  });

  it('drops disallowed characters', () => {
    expect(sanitizeSlug('a@b#c!d')).toBe('abcd');
  });

  it('caps length at 120 characters', () => {
    expect(sanitizeSlug('a'.repeat(200)).length).toBe(120);
  });

  it('returns an empty string for non-string input', () => {
    expect(sanitizeSlug(null)).toBe('');
  });
});

describe('sanitizeEmail', () => {
  it('accepts and lowercases a valid address', () => {
    expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
  });

  it('rejects malformed addresses', () => {
    expect(sanitizeEmail('not-an-email')).toBe('');
    expect(sanitizeEmail('@example.com')).toBe('');
    expect(sanitizeEmail('user@')).toBe('');
    expect(sanitizeEmail('user @example.com')).toBe('');
  });

  it('returns an empty string for non-string input', () => {
    expect(sanitizeEmail(undefined)).toBe('');
  });
});

describe('sanitizePhone', () => {
  it('accepts a bare 10-digit number', () => {
    expect(sanitizePhone('9876543210')).toBe('9876543210');
  });

  it('strips a +91 country code from a 12-digit number', () => {
    expect(sanitizePhone('+91 98765 43210')).toBe('9876543210');
  });

  it('ignores separators and formatting', () => {
    expect(sanitizePhone('(987) 654-3210')).toBe('9876543210');
  });

  it('rejects numbers of the wrong length', () => {
    expect(sanitizePhone('12345')).toBe('');
    expect(sanitizePhone('12345678901234')).toBe('');
  });

  it('returns an empty string for non-string input', () => {
    expect(sanitizePhone(null)).toBe('');
  });
});

describe('sanitizeUrl', () => {
  it('accepts http and https URLs', () => {
    expect(sanitizeUrl('https://example.org/path')).toBe('https://example.org/path');
    expect(sanitizeUrl('http://example.org/')).toBe('http://example.org/');
  });

  it('rejects non-http(s) protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('ftp://example.org/file')).toBe('');
    expect(sanitizeUrl('data:text/html,<script>')).toBe('');
  });

  it('rejects malformed input and empty values', () => {
    expect(sanitizeUrl('not a url')).toBe('');
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl('   ')).toBe('');
    expect(sanitizeUrl(null)).toBe('');
  });
});

describe('isHoneypotClean', () => {
  it('treats empty, null and undefined as clean (human)', () => {
    expect(isHoneypotClean('')).toBe(true);
    expect(isHoneypotClean(null)).toBe(true);
    expect(isHoneypotClean(undefined)).toBe(true);
  });

  it('treats any filled value as a bot', () => {
    expect(isHoneypotClean('bot')).toBe(false);
    expect(isHoneypotClean(' ')).toBe(false);
  });
});

describe('isValidSlug', () => {
  it('accepts a well-formed slug', () => {
    expect(isValidSlug('valid-slug-123')).toBe(true);
  });

  it('rejects uppercase, spaces, symbols and too-short values', () => {
    expect(isValidSlug('Invalid')).toBe(false);
    expect(isValidSlug('has space')).toBe(false);
    expect(isValidSlug('ab')).toBe(false);
  });
});

describe('truncate', () => {
  it('returns the original string when within the limit', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('adds an ellipsis when over the limit', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcd…');
  });

  it('keeps the result within the requested length', () => {
    expect(truncate('abcdefghij', 5)).toHaveLength(5);
  });
});
