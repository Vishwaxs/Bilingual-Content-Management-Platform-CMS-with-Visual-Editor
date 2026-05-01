// ─── Role types ───────────────────────────────────────────────
// 'superadmin' has ALL permissions (visual editor, user mgmt, system)
// 'admin' has standard CMS permissions (content CRUD, submissions)
// 'editor' / 'viewer' kept for backward-compat but are lower privilege
export type CmsRole = 'superadmin' | 'admin' | 'editor' | 'viewer';

// ─── Section types ────────────────────────────────────────────
export type CmsSection =
  | 'dashboard'
  | 'news'
  | 'leadership'
  | 'events'
  | 'documents'
  | 'focusAreas'
  | 'contacts'
  | 'memberships'
  // SuperAdmin-only sections:
  | 'users'
  | 'settings'
  | 'visualEditor'
  | 'content'
  | 'history'
  | 'system'
  | 'media'
  | 'profile';

// ─── Access matrix ────────────────────────────────────────────
// superadmin can access EVERYTHING; listed explicitly for clarity
const SECTION_ACCESS: Record<CmsSection, CmsRole[]> = {
  dashboard:    ['superadmin', 'admin'],
  news:         ['superadmin', 'admin', 'editor'],
  leadership:   ['superadmin', 'admin'],
  events:       ['superadmin', 'admin'],
  documents:    ['superadmin', 'admin'],
  focusAreas:   ['superadmin', 'admin'],
  contacts:     ['superadmin', 'admin'],
  memberships:  ['superadmin', 'admin'],
  profile:      ['superadmin', 'admin', 'editor'],
  // SuperAdmin-only:
  users:        ['superadmin'],
  settings:     ['superadmin'],
  visualEditor: ['superadmin'],
  content:      ['superadmin'],
  history:      ['superadmin'],
  system:       ['superadmin'],
  media:        ['superadmin', 'admin'],
};

// ─── Guards ───────────────────────────────────────────────────
export const isCmsRole = (value: unknown): value is CmsRole => {
  return value === 'superadmin' || value === 'admin' || value === 'editor' || value === 'viewer';
};

export const hasCmsAccess = (role: CmsRole | null): boolean => {
  return role === 'superadmin' || role === 'admin' || role === 'editor';
};

export const canAccessSection = (role: CmsRole | null, section: CmsSection): boolean => {
  if (!role) return false;
  return SECTION_ACCESS[section].includes(role);
};

export const isSuperAdminRole = (role: CmsRole | null): boolean => {
  return role === 'superadmin';
};
