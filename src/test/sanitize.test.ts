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

describe('sanitizeText', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(123)).toBe('');
    expect(sanitizeText({})).toBe('');
  });

  it('strips HTML tags', () => {
    expect(sanitizeText('<b>Hello</b>')).toBe('Hello');
    expect(sanitizeText('<a href="x">link</a>')).toBe('link');
  });

  it('removes script tags but keeps inner text (no execution surface)', () => {
    const out = sanitizeText('<script>alert(1)</script>safe');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('</script>');
    expect(out).toContain('safe');
  });

  it('strips the javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).not.toContain('javascript:');
  });

  it('strips inline event handler attributes', () => {
    expect(sanitizeText('onclick=alert(1)')).not.toMatch(/onclick\s*=/i);
  });

  it('trims whitespace', () => {
    expect(sanitizeText('   padded   ')).toBe('padded');
  });

  it('enforces the maxLength cap', () => {
    expect(sanitizeText('abcdef', 3)).toBe('abc');
    expect(sanitizeText('a'.repeat(600)).length).toBe(500);
  });
});

describe('sanitizeHtml', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(42)).toBe('');
  });

  it('keeps allowed formatting tags', () => {
    expect(sanitizeHtml('<p>Hello <strong>world</strong></p>')).toBe(
      '<p>Hello <strong>world</strong></p>',
    );
  });

  it('removes script tags and their contents', () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).toContain('<p>ok</p>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
  });

  it('removes style, iframe, object, embed and form tags', () => {
    expect(sanitizeHtml('<style>body{}</style>x')).not.toContain('<style');
    expect(sanitizeHtml('<iframe src="x"></iframe>x')).not.toContain('<iframe');
    expect(sanitizeHtml('<object data="x"></object>x')).not.toContain('<object');
    expect(sanitizeHtml('<embed src="x">x')).not.toContain('<embed');
    expect(sanitizeHtml('<form action="x"></form>x')).not.toContain('<form');
  });

  it('strips inline event handlers (quoted and unquoted)', () => {
    expect(sanitizeHtml('<p onclick="evil()">x</p>')).not.toMatch(/onclick/i);
    expect(sanitizeHtml('<p onmouseover=evil()>x</p>')).not.toMatch(/onmouseover/i);
  });

  it('neutralizes javascript: and vbscript: protocols', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:');
    expect(sanitizeHtml('<a href="vbscript:msgbox(1)">x</a>')).not.toContain('vbscript:');
  });

  it('blocks non-image data URIs but allows image data URIs through the protocol filter', () => {
    expect(sanitizeHtml('<a href="data:text/html,<script>">x</a>')).not.toContain('data:text/html');
    // Image data URIs are not rewritten to blocked: by the protocol filter.
    expect(sanitizeHtml('<span>data:image/png;base64,AAAA</span>')).toContain('data:image/png');
  });

  it('rewrites disallowed href protocols to a safe anchor', () => {
    const out = sanitizeHtml('<a href="ftp://example.com/file">x</a>');
    expect(out).toContain('href="#"');
    expect(out).not.toContain('ftp://');
  });

  it('preserves safe http/https/relative/fragment hrefs', () => {
    expect(sanitizeHtml('<a href="https://example.org">x</a>')).toContain('https://example.org');
    expect(sanitizeHtml('<a href="/docs">x</a>')).toContain('href="/docs"');
    expect(sanitizeHtml('<a href="#section">x</a>')).toContain('href="#section"');
  });

  it('strips img src values that are not http/https/relative', () => {
    const out = sanitizeHtml('<img src="javascript:alert(1)">');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('src=""');
  });

  it('caps output length at 200KB', () => {
    const huge = '<p>' + 'a'.repeat(300_000) + '</p>';
    expect(sanitizeHtml(huge).length).toBe(200_000);
  });
});

describe('sanitizeSlug', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeSlug(null)).toBe('');
    expect(sanitizeSlug(99)).toBe('');
  });

  it('lowercases and hyphenates words', () => {
    expect(sanitizeSlug('Hello World')).toBe('hello-world');
  });

  it('removes diacritics', () => {
    expect(sanitizeSlug('Héllo Wörld')).toBe('hello-world');
  });

  it('strips disallowed characters', () => {
    expect(sanitizeSlug('Hello! @World #2024')).toBe('hello-world-2024');
  });

  it('collapses and trims hyphens', () => {
    expect(sanitizeSlug('  --Hello--World--  ')).toBe('hello-world');
  });

  it('enforces the 120 character cap', () => {
    expect(sanitizeSlug('a'.repeat(200)).length).toBe(120);
  });
});

describe('sanitizeEmail', () => {
  it('normalizes valid emails to lowercase and trims', () => {
    expect(sanitizeEmail('  Test@Example.COM ')).toBe('test@example.com');
  });

  it('rejects invalid emails', () => {
    expect(sanitizeEmail('not-an-email')).toBe('');
    expect(sanitizeEmail('foo@')).toBe('');
    expect(sanitizeEmail('@bar.com')).toBe('');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeEmail(null)).toBe('');
    expect(sanitizeEmail(123)).toBe('');
  });
});

describe('sanitizePhone', () => {
  it('accepts plain 10-digit numbers', () => {
    expect(sanitizePhone('9876543210')).toBe('9876543210');
  });

  it('strips a +91 country code', () => {
    expect(sanitizePhone('+91 9876543210')).toBe('9876543210');
  });

  it('ignores formatting characters', () => {
    expect(sanitizePhone('98765-43210')).toBe('9876543210');
  });

  it('rejects numbers of the wrong length', () => {
    expect(sanitizePhone('12345')).toBe('');
    expect(sanitizePhone('123456789012345')).toBe('');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizePhone(null)).toBe('');
  });
});

describe('sanitizeUrl', () => {
  it('accepts http and https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toContain('https://example.com');
    expect(sanitizeUrl('http://example.com/path')).toContain('http://example.com/path');
  });

  it('rejects non-http(s) protocols', () => {
    expect(sanitizeUrl('ftp://example.com')).toBe('');
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('rejects malformed URLs', () => {
    expect(sanitizeUrl('not a url')).toBe('');
    expect(sanitizeUrl('')).toBe('');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeUrl(null)).toBe('');
  });
});

describe('isHoneypotClean', () => {
  it('treats empty, null and undefined as clean', () => {
    expect(isHoneypotClean('')).toBe(true);
    expect(isHoneypotClean(null)).toBe(true);
    expect(isHoneypotClean(undefined)).toBe(true);
  });

  it('treats any filled value as a bot signal', () => {
    expect(isHoneypotClean('bot')).toBe(false);
    expect(isHoneypotClean(' ')).toBe(false);
  });
});

describe('isValidSlug', () => {
  it('accepts well-formed slugs', () => {
    expect(isValidSlug('valid-slug-123')).toBe(true);
  });

  it('rejects slugs that are too short or too long', () => {
    expect(isValidSlug('ab')).toBe(false);
    expect(isValidSlug('a'.repeat(121))).toBe(false);
  });

  it('rejects uppercase letters and spaces', () => {
    expect(isValidSlug('Invalid Slug')).toBe(false);
    expect(isValidSlug('UPPER')).toBe(false);
  });
});

describe('truncate', () => {
  it('leaves short strings unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates long strings with an ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hell…');
  });
});
