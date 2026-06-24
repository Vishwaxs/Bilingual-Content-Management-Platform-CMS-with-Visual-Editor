import { describe, expect, it } from 'vitest';
import { eventAdminSchema, documentAdminSchema } from '@/lib/security/validate';
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

  it('enforces role-section permissions', () => {
    // Editors are limited to content sections only.
    expect(canAccessSection('editor', 'news')).toBe(true);
    expect(canAccessSection('editor', 'documents')).toBe(false);

    // Admins manage standard CMS content but NOT system settings.
    expect(canAccessSection('admin', 'documents')).toBe(true);
    expect(canAccessSection('admin', 'settings')).toBe(false);

    // Settings is a SuperAdmin-only section.
    expect(canAccessSection('superadmin', 'settings')).toBe(true);

    // A null/unauthenticated role can access nothing.
    expect(canAccessSection(null, 'news')).toBe(false);
  });
});
