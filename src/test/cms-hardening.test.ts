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
    expect(canAccessSection('editor', 'news')).toBe(true);
    expect(canAccessSection('editor', 'documents')).toBe(false);
    // 'settings' is a SuperAdmin-only section under the least-privilege model:
    // superadmin has full system access, admin is limited to content management.
    expect(canAccessSection('superadmin', 'settings')).toBe(true);
    expect(canAccessSection('admin', 'settings')).toBe(false);
  });

  it('restricts superadmin-only sections to superadmin', () => {
    const superAdminOnly = ['users', 'settings', 'visualEditor', 'content', 'history', 'system'] as const;
    for (const section of superAdminOnly) {
      expect(canAccessSection('superadmin', section)).toBe(true);
      expect(canAccessSection('admin', section)).toBe(false);
      expect(canAccessSection('editor', section)).toBe(false);
    }
  });

  it('grants admins content-management sections but denies viewers and unauthenticated users', () => {
    const adminSections = ['dashboard', 'leadership', 'events', 'documents', 'contacts', 'memberships'] as const;
    for (const section of adminSections) {
      expect(canAccessSection('admin', section)).toBe(true);
      expect(canAccessSection('viewer', section)).toBe(false);
      expect(canAccessSection(null, section)).toBe(false);
    }
  });
});
