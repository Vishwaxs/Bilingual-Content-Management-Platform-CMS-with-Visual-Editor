import { describe, expect, it } from 'vitest';
import {
  contactSchema,
  membershipSchema,
  newsAdminSchema,
  leaderAdminSchema,
  eventAdminSchema,
  documentAdminSchema,
  focusAreaAdminSchema,
} from '@/lib/security/validate';

// ---------------------------------------------------------------------------
// contactSchema
// ---------------------------------------------------------------------------
describe('contactSchema', () => {
  const valid = {
    name: 'Rahul Gupta',
    email: 'rahul@example.com',
    phone: '9876543210',
    district: 'Lucknow',
    message: 'This is a valid test message.',
    honeypot: '',
  };

  it('accepts a fully populated valid payload', () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts payload with optional fields omitted', () => {
    const { email, phone, district, ...minimal } = valid;
    const result = contactSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('strips HTML tags from name via sanitizeText', () => {
    const result = contactSchema.safeParse({ ...valid, name: '<b>Rahul</b>' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Rahul');
  });

  it('rejects name shorter than 2 characters', () => {
    const result = contactSchema.safeParse({ ...valid, name: 'R' });
    expect(result.success).toBe(false);
  });

  it('rejects message shorter than 10 characters', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone that does not match [6-9]XXXXXXXXX', () => {
    const result = contactSchema.safeParse({ ...valid, phone: '1234567890' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a district not in the UP list', () => {
    const result = contactSchema.safeParse({ ...valid, district: 'Mumbai' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-empty honeypot (bot trap)', () => {
    const result = contactSchema.safeParse({ ...valid, honeypot: 'filled-by-bot' });
    expect(result.success).toBe(false);
  });

  it('treats empty string email as absent', () => {
    const result = contactSchema.safeParse({ ...valid, email: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('');
  });
});

// ---------------------------------------------------------------------------
// membershipSchema
// ---------------------------------------------------------------------------
describe('membershipSchema', () => {
  const valid = {
    full_name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '8800112233',
    district: 'Agra',
    message: 'Interested in joining.',
    honeypot: '',
  };

  it('accepts a valid membership payload', () => {
    const result = membershipSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects full_name shorter than 3 characters', () => {
    const result = membershipSchema.safeParse({ ...valid, full_name: 'AB' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing phone (phone is required)', () => {
    const { phone, ...noPhone } = valid;
    const result = membershipSchema.safeParse(noPhone);
    expect(result.success).toBe(false);
  });

  it('rejects a district not in the UP list', () => {
    const result = membershipSchema.safeParse({ ...valid, district: 'Delhi' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-empty honeypot', () => {
    const result = membershipSchema.safeParse({ ...valid, honeypot: 'bot' });
    expect(result.success).toBe(false);
  });

  it('accepts payload without optional message', () => {
    const { message, ...noMsg } = valid;
    const result = membershipSchema.safeParse(noMsg);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// newsAdminSchema
// ---------------------------------------------------------------------------
describe('newsAdminSchema', () => {
  const valid = {
    title_en: 'Breaking News',
    slug: 'breaking-news-2026',
    body_en: 'Full article content goes here.',
    status: 'draft' as const,
  };

  it('accepts a minimal valid news payload', () => {
    const result = newsAdminSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts published_at as null', () => {
    const result = newsAdminSchema.safeParse({ ...valid, published_at: null });
    expect(result.success).toBe(true);
  });

  it('rejects a slug with uppercase letters', () => {
    const result = newsAdminSchema.safeParse({ ...valid, slug: 'Breaking-News' });
    expect(result.success).toBe(false);
  });

  it('rejects a slug shorter than 3 characters', () => {
    const result = newsAdminSchema.safeParse({ ...valid, slug: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status value', () => {
    const result = newsAdminSchema.safeParse({ ...valid, status: 'live' });
    expect(result.success).toBe(false);
  });

  it('accepts all three valid status values', () => {
    for (const status of ['draft', 'published', 'archived'] as const) {
      expect(newsAdminSchema.safeParse({ ...valid, status }).success).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// eventAdminSchema — superRefine: published requires event_date
// ---------------------------------------------------------------------------
describe('eventAdminSchema', () => {
  const base = {
    title_en: 'Annual Meet',
    slug: 'annual-meet-2026',
    status: 'draft' as const,
  };

  it('allows a draft event without an event_date', () => {
    const result = eventAdminSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('rejects a published event with no event_date', () => {
    const result = eventAdminSchema.safeParse({ ...base, status: 'published' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path.join('.'));
      expect(paths).toContain('event_date');
    }
  });

  it('accepts a published event when event_date is provided', () => {
    const result = eventAdminSchema.safeParse({
      ...base,
      status: 'published',
      event_date: '2026-08-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid slug', () => {
    const result = eventAdminSchema.safeParse({ ...base, slug: 'Annual Meet!' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// documentAdminSchema
// ---------------------------------------------------------------------------
describe('documentAdminSchema', () => {
  const valid = {
    title_en: 'Government Circular 2026',
    category: 'circular' as const,
    file_url: 'https://example.gov.in/docs/circular.pdf',
    is_public: true,
  };

  it('accepts a valid document payload', () => {
    const result = documentAdminSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects a non-URL file_url', () => {
    const result = documentAdminSchema.safeParse({ ...valid, file_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid category', () => {
    const result = documentAdminSchema.safeParse({ ...valid, category: 'memo' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid category values', () => {
    for (const category of ['circular', 'report', 'policy', 'press', 'other'] as const) {
      expect(documentAdminSchema.safeParse({ ...valid, category }).success).toBe(true);
    }
  });

  it('accepts optional file_size within limit', () => {
    const result = documentAdminSchema.safeParse({ ...valid, file_size: 1024 * 1024 });
    expect(result.success).toBe(true);
  });

  it('rejects file_size over 25 MB', () => {
    const result = documentAdminSchema.safeParse({ ...valid, file_size: 26 * 1024 * 1024 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// leaderAdminSchema
// ---------------------------------------------------------------------------
describe('leaderAdminSchema', () => {
  const valid = {
    name_en: 'Shri Ram Prasad',
    designation_en: 'State President',
    is_active: true,
  };

  it('accepts a minimal valid leader payload', () => {
    const result = leaderAdminSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects name_en shorter than 2 characters', () => {
    const result = leaderAdminSchema.safeParse({ ...valid, name_en: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects designation_en shorter than 2 characters', () => {
    const result = leaderAdminSchema.safeParse({ ...valid, designation_en: 'X' });
    expect(result.success).toBe(false);
  });

  it('defaults display_order to 999', () => {
    const result = leaderAdminSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.display_order).toBe(999);
  });

  it('rejects display_order over 9999', () => {
    const result = leaderAdminSchema.safeParse({ ...valid, display_order: 10000 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// focusAreaAdminSchema
// ---------------------------------------------------------------------------
describe('focusAreaAdminSchema', () => {
  const valid = {
    title_en: 'Education',
    is_active: true,
  };

  it('accepts a minimal valid focus area payload', () => {
    const result = focusAreaAdminSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects title_en shorter than 2 characters', () => {
    const result = focusAreaAdminSchema.safeParse({ ...valid, title_en: 'E' });
    expect(result.success).toBe(false);
  });

  it('rejects display_order over 9999', () => {
    const result = focusAreaAdminSchema.safeParse({ ...valid, display_order: 10000 });
    expect(result.success).toBe(false);
  });

  it('defaults icon to the prayer-hands emoji', () => {
    const result = focusAreaAdminSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.icon).toBe('\u{1F64F}');
  });
});
