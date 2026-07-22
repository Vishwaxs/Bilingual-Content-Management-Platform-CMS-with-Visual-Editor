import { describe, expect, it } from 'vitest';
import {
  canAccessSection,
  hasCmsAccess,
  isCmsRole,
  isSuperAdminRole,
  type CmsRole,
  type CmsSection,
} from '@/lib/auth/permissions';

describe('permissions: isCmsRole', () => {
  it('accepts the four known roles', () => {
    for (const role of ['superadmin', 'admin', 'editor', 'viewer'] as const) {
      expect(isCmsRole(role)).toBe(true);
    }
  });

  it('rejects unknown or malformed values', () => {
    for (const value of ['root', 'Admin', '', null, undefined, 0, {}, ['admin']]) {
      expect(isCmsRole(value)).toBe(false);
    }
  });
});

describe('permissions: hasCmsAccess', () => {
  it('grants CMS access to superadmin, admin and editor', () => {
    expect(hasCmsAccess('superadmin')).toBe(true);
    expect(hasCmsAccess('admin')).toBe(true);
    expect(hasCmsAccess('editor')).toBe(true);
  });

  it('denies CMS access to viewer and null', () => {
    expect(hasCmsAccess('viewer')).toBe(false);
    expect(hasCmsAccess(null)).toBe(false);
  });
});

describe('permissions: isSuperAdminRole', () => {
  it('is true only for superadmin', () => {
    expect(isSuperAdminRole('superadmin')).toBe(true);
    expect(isSuperAdminRole('admin')).toBe(false);
    expect(isSuperAdminRole('editor')).toBe(false);
    expect(isSuperAdminRole('viewer')).toBe(false);
    expect(isSuperAdminRole(null)).toBe(false);
  });
});

describe('permissions: canAccessSection', () => {
  const superadminOnly: CmsSection[] = ['users', 'settings', 'visualEditor', 'content', 'history', 'system'];
  const adminSections: CmsSection[] = [
    'dashboard', 'news', 'leadership', 'events', 'documents',
    'focusAreas', 'contacts', 'memberships', 'media', 'profile',
  ];

  it('denies every section when role is null', () => {
    for (const section of [...adminSections, ...superadminOnly]) {
      expect(canAccessSection(null, section)).toBe(false);
    }
  });

  it('grants superadmin access to every section', () => {
    for (const section of [...adminSections, ...superadminOnly]) {
      expect(canAccessSection('superadmin', section)).toBe(true);
    }
  });

  it('restricts superadmin-only sections from admin', () => {
    for (const section of superadminOnly) {
      expect(canAccessSection('admin', section)).toBe(false);
    }
  });

  it('grants admin the standard CMS sections', () => {
    for (const section of adminSections) {
      expect(canAccessSection('admin', section)).toBe(true);
    }
  });

  it('limits editor to news and profile only', () => {
    expect(canAccessSection('editor', 'news')).toBe(true);
    expect(canAccessSection('editor', 'profile')).toBe(true);
    expect(canAccessSection('editor', 'documents')).toBe(false);
    expect(canAccessSection('editor', 'dashboard')).toBe(false);
    expect(canAccessSection('editor', 'settings')).toBe(false);
  });

  it('denies viewer every section', () => {
    for (const section of [...adminSections, ...superadminOnly]) {
      expect(canAccessSection('viewer', section)).toBe(false);
    }
  });

  it('fails closed for an unknown section instead of throwing', () => {
    const unknownSection = 'not-a-real-section' as CmsSection;
    for (const role of ['superadmin', 'admin', 'editor', 'viewer'] as CmsRole[]) {
      expect(() => canAccessSection(role, unknownSection)).not.toThrow();
      expect(canAccessSection(role, unknownSection)).toBe(false);
    }
  });
});
