// Deno-compatible version of sanitize utilities for Edge Functions

export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input.trim()
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, maxLength);
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  const email = input.trim().toLowerCase().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return '';
}

export function isHoneypotClean(value: unknown): boolean {
  return value === '' || value === null || value === undefined;
}

export const UP_DISTRICTS = new Set([
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
]);
