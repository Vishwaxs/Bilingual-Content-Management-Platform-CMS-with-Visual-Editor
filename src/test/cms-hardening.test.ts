import { describe, expect, it } from 'vitest';
import {
  eventAdminSchema,
  documentAdminSchema,
  newsAdminSchema,
  leaderAdminSchema,
} from '@/lib/security/validate';
import { canAccessSection } from '@/lib/auth/permissions';

describe('cms hardening guards', () => {
  it('blocks publishing events without date', () => {
    const parsed = eventAdminSchema.safeParse({
      title_en: 'District Meeting',
      slug: 'district-meeting',
      status: 'published',
      event_date: null,
    });

    expect(parsed.success).toBe(false);
  });

  it('accepts draft events without date', () => {
    const parsed = eventAdminSchema.safeParse({
      title_en: 'Draft Meeting',
      slug: 'draft-meeting',
      status: 'draft',
      event_date: null,
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts only valid http/https document URLs', () => {
    const valid = documentAdminSchema.safeParse({
      title_en: 'Circular',
      category: 'circular',
      file_url: 'https://example.org/circular.pdf',
      is_public: true,
    });

    const invalid = documentAdminSchema.safeParse({
      title_en: 'Unsafe Link',
      category: 'circular',
      file_url: 'javascript:alert(1)',
      is_public: true,
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it('rejects unsafe protocols in image/cover URLs', () => {
    const unsafeNews = newsAdminSchema.safeParse({
      title_en: 'Breaking',
      slug: 'breaking-news',
      body_en: 'Body content',
      status: 'draft',
      featured_image: 'javascript:alert(1)',
    });
    expect(unsafeNews.success).toBe(false);

    const unsafeLeader = leaderAdminSchema.safeParse({
      name_en: 'Jane Doe',
      designation_en: 'President',
      photo_url: 'data:text/html,<script>alert(1)</script>',
    });
    expect(unsafeLeader.success).toBe(false);

    const unsafeEvent = eventAdminSchema.safeParse({
      title_en: 'Rally',
      slug: 'annual-rally',
      status: 'draft',
      cover_image: 'javascript:alert(1)',
    });
    expect(unsafeEvent.success).toBe(false);
  });

  it('accepts valid http(s) image URLs and allows blank', () => {
    const withImage = newsAdminSchema.safeParse({
      title_en: 'Breaking',
      slug: 'breaking-news',
      body_en: 'Body content',
      status: 'draft',
      featured_image: 'https://cdn.example.org/hero.jpg',
    });
    expect(withImage.success).toBe(true);
    if (withImage.success) {
      expect(withImage.data.featured_image).toBe('https://cdn.example.org/hero.jpg');
    }

    const withoutImage = newsAdminSchema.safeParse({
      title_en: 'Breaking',
      slug: 'breaking-news-2',
      body_en: 'Body content',
      status: 'draft',
      featured_image: '',
    });
    expect(withoutImage.success).toBe(true);
  });

  it('enforces role-section permissions', () => {
    expect(canAccessSection('editor', 'news')).toBe(true);
    expect(canAccessSection('editor', 'documents')).toBe(false);
    expect(canAccessSection('admin', 'settings')).toBe(true);
  });
});
