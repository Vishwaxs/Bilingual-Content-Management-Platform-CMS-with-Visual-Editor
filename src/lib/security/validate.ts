// src/lib/security/validate.ts
// Zod-based validation schemas for all form data.

import { z } from 'zod';
import { sanitizeText, sanitizeEmail, sanitizeUrl } from './sanitize';

export const UP_DISTRICTS = [
  'Agra','Aligarh','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya',
  'Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki',
  'Bareilly','Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli',
  'Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad',
  'Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur',
  'Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi','Kannauj',
  'Kanpur Dehat','Kanpur Nagar','Kasganj','Kaushambi','Lakhimpur Kheri','Kushinagar',
  'Lalitpur','Lucknow','Maharajganj','Mahoba','Mainpuri','Mathura','Mau',
  'Meerut','Mirzapur','Moradabad','Muzaffarnagar','Pilibhit','Pratapgarh',
  'Prayagraj','Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar',
  'Shahjahanpur','Shamli','Shravasti','Siddharthnagar','Sitapur','Sonbhadra',
  'Sultanpur','Unnao','Varanasi',
] as const;

const mobileRegex = /^[6-9][0-9]{9}$/;
const isValidDistrict = (value: string) => (UP_DISTRICTS as readonly string[]).includes(value);

// Optional image/URL field that only permits http(s) URLs.
// zod's .url() defers to the URL constructor, which happily accepts
// javascript:, data: and other unsafe protocols. Route the value through
// sanitizeUrl so these fields enforce the same http/https allowlist as
// documentAdminSchema.file_url, then normalise the stored value.
const optionalImageUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || sanitizeUrl(value) !== '', {
    message: 'Only http/https image URLs are allowed',
  })
  .transform((value) => (value ? sanitizeUrl(value) : ''));

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).transform(v => sanitizeText(v, 100)),
  email: z.string().trim().email('Invalid email').max(200).optional().or(z.literal('')).transform(v => v ? sanitizeEmail(v) : ''),
  phone: z.string().trim().regex(mobileRegex, 'Enter a valid 10-digit mobile number').optional().or(z.literal('')),
  district: z.string().trim().optional().or(z.literal('')).refine((value) => !value || isValidDistrict(value), {
    message: 'Select a valid UP district',
  }),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000).transform(v => sanitizeText(v, 2000)),
  honeypot: z.string().max(0, 'Bot detected').default(''),
});

export const membershipSchema = z.object({
  full_name: z.string().trim().min(3, 'Full name required').max(100).transform(v => sanitizeText(v, 100)),
  email: z.string().trim().email('Invalid email').max(200).optional().or(z.literal('')),
  phone: z.string().trim().regex(mobileRegex, 'Enter valid 10-digit mobile number'),
  district: z.string().trim().refine((value) => isValidDistrict(value), { message: 'Select a valid UP district' }),
  message: z.string().trim().max(500).optional().transform(v => v ? sanitizeText(v, 500) : undefined),
  honeypot: z.string().max(0, 'Bot detected').default(''),
});

export const newsAdminSchema = z.object({
  title_en: z.string().min(3).max(200).transform(v => sanitizeText(v, 200)),
  title_hi: z.string().max(200).optional().transform(v => v ? sanitizeText(v, 200) : undefined),
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  excerpt_en: z.string().max(400).optional().transform(v => v ? sanitizeText(v, 400) : undefined),
  excerpt_hi: z.string().max(400).optional().transform(v => v ? sanitizeText(v, 400) : undefined),
  body_en: z.string().max(200_000),
  body_hi: z.string().max(200_000).optional(),
  category: z.string().default('announcement'),
  meta_title_en: z.string().max(70).optional().transform(v => v ? sanitizeText(v, 70) : undefined),
  meta_title_hi: z.string().max(70).optional().transform(v => v ? sanitizeText(v, 70) : undefined),
  meta_description_en: z.string().max(170).optional().transform(v => v ? sanitizeText(v, 170) : undefined),
  meta_description_hi: z.string().max(170).optional().transform(v => v ? sanitizeText(v, 170) : undefined),
  featured_image: optionalImageUrl,
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().datetime().optional().nullable(),
});

export const leaderAdminSchema = z.object({
  name_en: z.string().min(2).max(100).transform(v => sanitizeText(v, 100)),
  name_hi: z.string().max(100).optional().transform(v => v ? sanitizeText(v, 100) : undefined),
  designation_en: z.string().min(2).max(100).transform(v => sanitizeText(v, 100)),
  designation_hi: z.string().max(100).optional().transform(v => v ? sanitizeText(v, 100) : undefined),
  bio_en: z.string().max(1000).optional().transform(v => v ? sanitizeText(v, 1000) : undefined),
  bio_hi: z.string().max(1000).optional().transform(v => v ? sanitizeText(v, 1000) : undefined),
  photo_url: optionalImageUrl,
  display_order: z.number().int().min(0).max(9999).default(999),
  is_active: z.boolean().default(true),
});

export const eventAdminSchema = z.object({
  title_en: z.string().min(3).max(200).transform(v => sanitizeText(v, 200)),
  title_hi: z.string().max(200).optional().transform(v => v ? sanitizeText(v, 200) : undefined),
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/),
  description_en: z.string().max(10_000).optional(),
  description_hi: z.string().max(10_000).optional(),
  event_date: z.string().optional().nullable(),
  event_time: z.string().max(50).optional().transform(v => v ? sanitizeText(v, 50) : undefined),
  location_en: z.string().max(200).optional().transform(v => v ? sanitizeText(v, 200) : undefined),
  location_hi: z.string().max(200).optional().transform(v => v ? sanitizeText(v, 200) : undefined),
  cover_image: optionalImageUrl,
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
}).superRefine((data, ctx) => {
  if (data.status === 'published' && !data.event_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['event_date'],
      message: 'Event date is required before publishing',
    });
  }
});

export const documentAdminSchema = z.object({
  title_en: z.string().trim().min(2).max(200).transform(v => sanitizeText(v, 200)),
  title_hi: z.string().trim().max(200).optional().transform(v => v ? sanitizeText(v, 200) : ''),
  category: z.enum(['circular', 'report', 'policy', 'press', 'other']),
  file_url: z.string().trim().url('Provide a valid file URL').transform(v => sanitizeUrl(v)).refine((v) => !!v, {
    message: 'Only http/https URLs are allowed',
  }),
  file_size: z.number().int().min(0).max(25 * 1024 * 1024).optional().nullable(),
  is_public: z.boolean().default(true),
});

export const focusAreaAdminSchema = z.object({
  title_en: z.string().min(2).max(100).transform(v => sanitizeText(v, 100)),
  title_hi: z.string().max(100).optional().transform(v => v ? sanitizeText(v, 100) : undefined),
  description_en: z.string().max(500).optional().transform(v => v ? sanitizeText(v, 500) : undefined),
  description_hi: z.string().max(500).optional().transform(v => v ? sanitizeText(v, 500) : undefined),
  icon: z.string().max(10).default('🙏'),
  display_order: z.number().int().min(0).max(9999).default(999),
  is_active: z.boolean().default(true),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type MembershipFormData = z.infer<typeof membershipSchema>;
export type NewsAdminData = z.infer<typeof newsAdminSchema>;
export type LeaderAdminData = z.infer<typeof leaderAdminSchema>;
export type EventAdminData = z.infer<typeof eventAdminSchema>;
export type DocumentAdminData = z.infer<typeof documentAdminSchema>;
export type FocusAreaAdminData = z.infer<typeof focusAreaAdminSchema>;
