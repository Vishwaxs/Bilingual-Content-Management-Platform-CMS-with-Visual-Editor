import { describe, it, expect } from 'vitest';
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
 * These tests lock in the behavior of the security sanitizers. The output of
 * `sanitizeHtml` is rendered through `dangerouslySetInnerHTML` in NewsDetail
 * and EventDetail, so its XSS-blocking behavior is security-critical and any
 * regression here should fail the build.
 */

describe('sanitizeText', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(42)).toBe('');
    expect(sanitizeText({})).toBe('');
  });

  it('strips all HTML tags, JS protocol, and inline event handlers', () => {
    expect(sanitizeText('  <b>Hi</b> javascript:alert onclick= end ')).toBe('Hi alert  end');
  });

  it('removes event-handler attributes even without surrounding tags', () => {
    expect(sanitizeText('x onload=y')).toBe('x y');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeText('   hello   ')).toBe('hello');
  });

  it('enforces the max length (default 500)', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeText(long)).toHaveLength(500);
  });

  it('honors a custom max length', () => {
    expect(sanitizeText('abcdef', 3)).toBe('abc');
  });
});

describe('sanitizeHtml', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(42)).toBe('');
  });

  it('removes <script> tags and their contents', () => {
    expect(sanitizeHtml('<script>alert(1)</script>Hello')).toBe('Hello');
  });

  it('removes <style>, <iframe>, <object>, <embed>, and <form> blocks', () => {
    expect(sanitizeHtml('<style>body{}</style>hi')).toBe('hi');
    expect(sanitizeHtml('a<iframe src="x">y</iframe>b')).toBe('ab');
    expect(sanitizeHtml('a<object data="x">y</object>b')).toBe('ab');
    expect(sanitizeHtml('a<embed src="x">b')).toBe('ab');
    expect(sanitizeHtml('a<form action="x">y</form>b')).toBe('ab');
  });

  it('strips quoted inline event handlers', () => {
    expect(sanitizeHtml('<p onclick="evil()">x</p>')).toBe('<p >x</p>');
  });

  it('strips unquoted inline event handlers', () => {
    expect(sanitizeHtml('<p onmouseover=evil()>x</p>')).toBe('<p >x</p>');
  });

  it('neutralizes javascript: and vbscript: hrefs (case-insensitive)', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a href="#">x</a>');
    expect(sanitizeHtml('<a href="JavaScript:alert(1)">x</a>')).toBe('<a href="#">x</a>');
    expect(sanitizeHtml('<a href="vbscript:msgbox(1)">x</a>')).toBe('<a href="#">x</a>');
  });

  it('rejects non-http(s) protocols in hrefs', () => {
    expect(sanitizeHtml('<a href="ftp://x">x</a>')).toBe('<a href="#">x</a>');
  });

  it('preserves safe http/https, anchor, and relative hrefs', () => {
    expect(sanitizeHtml('<a href="https://a.com/x">x</a>')).toBe('<a href="https://a.com/x">x</a>');
    expect(sanitizeHtml('<a href="#section">x</a>')).toBe('<a href="#section">x</a>');
    expect(sanitizeHtml('<a href="/local">x</a>')).toBe('<a href="/local">x</a>');
  });

  it('preserves safe formatting markup untouched', () => {
    expect(sanitizeHtml('<p>ok <b>bold</b> <em>italic</em></p>')).toBe(
      '<p>ok <b>bold</b> <em>italic</em></p>',
    );
  });

  it('blocks image src values that are not http(s) or relative (fail-closed)', () => {
    // The `data:image/*` allowlist in the protocol pass is intentionally
    // superseded by the stricter src-attribute protocol check, which only
    // permits http(s) and root-relative URLs. Non-conforming src values —
    // including otherwise-allowed image data URIs — are emptied. This is
    // fail-closed: a legitimate inline image may be dropped, but no unsafe
    // src can survive.
    expect(sanitizeHtml('<img src="data:text/html,evil">')).toBe('<img src="">');
    expect(sanitizeHtml('<img src="data:image/png;base64,abc">')).toBe('<img src="">');
    expect(sanitizeHtml('<img src="/logo.png">')).toBe('<img src="/logo.png">');
    expect(sanitizeHtml('<img src="https://cdn.example.com/a.png">')).toBe(
      '<img src="https://cdn.example.com/a.png">',
    );
  });

  it('caps output at 200KB', () => {
    const huge = '<b>' + 'a'.repeat(300_000) + '</b>';
    expect(sanitizeHtml(huge)).toHaveLength(200_000);
  });
});

describe('sanitizeSlug', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeSlug(undefined)).toBe('');
    expect(sanitizeSlug(123)).toBe('');
  });

  it('lowercases, strips diacritics and punctuation, and hyphenates spaces', () => {
    expect(sanitizeSlug('  Héllo Wörld!! Foo  ')).toBe('hello-world-foo');
  });

  it('collapses repeated hyphens and trims leading/trailing hyphens', () => {
    expect(sanitizeSlug('--A  B--')).toBe('a-b');
  });

  it('caps the slug at 120 characters', () => {
    expect(sanitizeSlug('a'.repeat(200)).length).toBeLessThanOrEqual(120);
  });
});

describe('sanitizeEmail', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeEmail(undefined)).toBe('');
  });

  it('trims and lowercases a valid email', () => {
    expect(sanitizeEmail('  Foo@Bar.COM ')).toBe('foo@bar.com');
  });

  it('returns empty string for malformed emails', () => {
    expect(sanitizeEmail('not-an-email')).toBe('');
    expect(sanitizeEmail('@b.com')).toBe('');
    expect(sanitizeEmail('foo@')).toBe('');
    expect(sanitizeEmail('foo bar@baz.com')).toBe('');
  });
});

describe('sanitizePhone', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizePhone(undefined)).toBe('');
  });

  it('accepts a 10-digit number, stripping formatting', () => {
    expect(sanitizePhone('(987) 654-3210')).toBe('9876543210');
  });

  it('strips a +91 country code from a 12-digit number', () => {
    expect(sanitizePhone('+91 98765 43210')).toBe('9876543210');
  });

  it('rejects numbers of the wrong length', () => {
    expect(sanitizePhone('12345')).toBe('');
    expect(sanitizePhone('1234567890123')).toBe('');
  });
});

describe('sanitizeUrl', () => {
  it('returns empty string for non-string or blank input', () => {
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl('   ')).toBe('');
  });

  it('accepts http and https URLs', () => {
    expect(sanitizeUrl(' https://a.com/x ')).toBe('https://a.com/x');
  });

  it('rejects javascript:, ftp:, and other non-http protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('ftp://a.com')).toBe('');
  });

  it('rejects unparseable input', () => {
    expect(sanitizeUrl('not a url')).toBe('');
  });
});

describe('isHoneypotClean', () => {
  it('treats empty string, null, and undefined as clean', () => {
    expect(isHoneypotClean('')).toBe(true);
    expect(isHoneypotClean(null)).toBe(true);
    expect(isHoneypotClean(undefined)).toBe(true);
  });

  it('treats any filled value as a bot signal', () => {
    expect(isHoneypotClean('x')).toBe(false);
    expect(isHoneypotClean(0)).toBe(false);
  });
});

describe('isValidSlug', () => {
  it('accepts lowercase alphanumeric-hyphen slugs of 3-120 chars', () => {
    expect(isValidSlug('abc')).toBe(true);
    expect(isValidSlug('my-post-1')).toBe(true);
  });

  it('rejects too-short, uppercase, or invalid-character slugs', () => {
    expect(isValidSlug('ab')).toBe(false);
    expect(isValidSlug('Bad_Slug')).toBe(false);
    expect(isValidSlug('has space')).toBe(false);
  });
});

describe('truncate', () => {
  it('returns the text unchanged when within the limit', () => {
    expect(truncate('hi', 5)).toBe('hi');
  });

  it('truncates and appends an ellipsis when over the limit', () => {
    expect(truncate('hello world', 5)).toBe('hell…');
  });
});
