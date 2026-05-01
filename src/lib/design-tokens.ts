// Design tokens for ABHM UP
export const colors = {
  saffron: '#FF6B00',
  saffronLight: '#FF9933',
  saffronPale: '#FFF4E6',
  navy: '#0B1F3A',
  navyMid: '#122B52',
  navyLight: '#1A3A6B',
  gold: '#C9942A',
  goldLight: '#F5C842',
  greenFlag: '#138808',
  white: '#FFFFFF',
  offWhite: '#F8F6F2',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
} as const;

export const gradients = {
  heroBackground: 'linear-gradient(135deg, #0B1F3A 0%, #122B52 50%, #0B1F3A 100%)',
  heroGlow: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(255,107,0,0.12), transparent 60%)',
  ctaBackground: 'linear-gradient(135deg, #FF6B00 0%, #E55A00 100%)',
  tricolor: 'linear-gradient(90deg, #FF9933 33.33%, #FFFFFF 33.33% 66.66%, #138808 66.66%)',
} as const;

export const UP_DISTRICTS = [
  'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya',
  'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki',
  'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli',
  'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad',
  'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur',
  'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj',
  'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri',
  'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau',
  'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
  'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar',
  'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra',
  'Sultanpur', 'Unnao', 'Varanasi'
] as const;
