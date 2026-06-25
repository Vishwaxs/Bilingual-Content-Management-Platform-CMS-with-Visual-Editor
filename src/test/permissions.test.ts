import { describe, expect, it } from 'vitest';
import {
  canAccessSection,
  hasCmsAccess,
  isCmsRole,
  isSuperAdminRole,
  type CmsRole,
  type CmsSection,
} from '@/lib/auth/permissions';

// Sections that must remain SuperAdmin-only. These mirror the
// "SuperAdmin-only routes" group in App.tsx — keep the two in sync.
const SUPERADMIN_ONLY: CmsSection[] = [
  'users',
  'settings',
  'visualEditor',
  'content',
  'history',
  'system',
];

// Sections a standard admin is expected to manage.
const ADMIN_SECTIONS: CmsSection[] = [
  'dashboard',
  'news',
  'leadership',
  'events',
  'documents',
  'focusAreas',
  'contacts',
  'memberships',
  'profile',
  'media',
];

const ALL_SECTIONS: CmsSection[] = [...ADMIN_SECTIONS, ...SUPERADMIN_ONLY];

describe('permissions: canAccessSection', () => {
  it('denies access when role is null', () => {
    for (const section of ALL_SECTIONS) {
      expect(canAccessSection(null, section)).toBe(false);
    }
  });

  it('grants superadmin access to every section', () => {
    for (const section of ALL_SECTIONS) {
      expect(canAccessSection('superadmin', section)).toBe(true);
    }
  });

  it('grants admin access to standard CMS sections', () => {
    for (const section of ADMIN_SECTIONS) {
      expect(canAccessSection('admin', section)).toBe(true);
    }
  });

  it('blocks admin from every superadmin-only section', () => {
    for (const section of SUPERADMIN_ONLY) {
      expect(canAccessSection('admin', section)).toBe(false);
    }
  });

  it('limits editor to news and profile only', () => {
    expect(canAccessSection('editor', 'news')).toBe(true);
    expect(canAccessSection('editor', 'profile')).toBe(true);

    const editorDenied = ALL_SECTIONS.filter(
      (s) => s !== 'news' && s !== 'profile',
    );
    for (const section of editorDenied) {
      expect(canAccessSection('editor', section)).toBe(false);
    }
  });

  it('grants viewer no section access', () => {
    for (const section of ALL_SECTIONS) {
      expect(canAccessSection('viewer', section)).toBe(false);
    }
  });
});

describe('permissions: role guards', () => {
  it('isCmsRole accepts known roles and rejects everything else', () => {
    for (const role of ['superadmin', 'admin', 'editor', 'viewer'] as CmsRole[]) {
      expect(isCmsRole(role)).toBe(true);
    }
    for (const value of ['', 'root', 'ADMIN', null, undefined, 0, {}]) {
      expect(isCmsRole(value)).toBe(false);
    }
  });

  it('hasCmsAccess admits CMS roles but not viewer or null', () => {
    expect(hasCmsAccess('superadmin')).toBe(true);
    expect(hasCmsAccess('admin')).toBe(true);
    expect(hasCmsAccess('editor')).toBe(true);
    expect(hasCmsAccess('viewer')).toBe(false);
    expect(hasCmsAccess(null)).toBe(false);
  });

  it('isSuperAdminRole is true only for superadmin', () => {
    expect(isSuperAdminRole('superadmin')).toBe(true);
    expect(isSuperAdminRole('admin')).toBe(false);
    expect(isSuperAdminRole('editor')).toBe(false);
    expect(isSuperAdminRole('viewer')).toBe(false);
    expect(isSuperAdminRole(null)).toBe(false);
  });
});
