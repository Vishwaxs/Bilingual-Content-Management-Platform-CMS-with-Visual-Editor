// scripts/seed.ts
// Run with: npx tsx scripts/seed.ts
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const SITE_SETTINGS: Array<{ key: string; value: unknown }> = [
  { key: 'site_name', value: 'Akhil Bharat Hindu Mahasabha (U.P.)' },
  { key: 'site_name_hi', value: 'अखिल भारत हिन्दू महासभा (उ.प्र.)' },
  { key: 'tagline', value: 'Serving Sanatan Dharma and the Nation Since 1915' },
  { key: 'tagline_hi', value: '1915 से सनातन धर्म और राष्ट्र की सेवा में' },
  { key: 'founded_year', value: '1915' },
  { key: 'founded_location', value: 'Haridwar Kumbh Mela' },
  { key: 'founded_location_hi', value: 'हरिद्वार कुंभ मेला' },
  { key: 'districts_count', value: '75' },
  { key: 'members_count', value: '5 Lakh+' },
  { key: 'mandals_count', value: '500+' },
  { key: 'contact_phone_national', value: '93121 77979' },
  { key: 'contact_phone_secretary', value: '81788 31850' },
  { key: 'contact_phone_office', value: '98717 14028' },
  { key: 'contact_phone', value: '93121 77979' },
  { key: 'contact_email', value: 'info@abhm-up.org' },
  { key: 'contact_address', value: 'ABHM Bhawan, Hazratganj, Lucknow, Uttar Pradesh 226001' },
  { key: 'contact_address_hi', value: 'ABHM भवन, हजरतगंज, लखनऊ, उत्तर प्रदेश 226001' },
  { key: 'whatsapp_number', value: '93121 77979' },
  { key: 'twitter_url', value: '' },
  { key: 'facebook_url', value: '' },
  { key: 'youtube_url', value: '' },
  {
    key: 'ticker_items',
    value: [
      'ABHM UP - Akhil Bharat Hindu Mahasabha Uttar Pradesh official website',
      'Founded in 1915 at Haridwar Kumbh Mela',
      'Serving Sanatan Dharma across all 75 districts of Uttar Pradesh',
      'स्थापना 1915 हरिद्वार कुंभ मेला',
      'उत्तर प्रदेश के सभी 75 जिलों में सनातन धर्म की सेवा',
    ],
  },
  {
    key: 'seo_description',
    value:
      'Official website of Akhil Bharat Hindu Mahasabha Uttar Pradesh (ABHM UP). Serving Sanatan Dharma and the nation since 1915, founded at Haridwar Kumbh Mela.',
  },
  {
    key: 'seo_description_hi',
    value:
      'अखिल भारत हिन्दू महासभा उत्तर प्रदेश (ABHM UP) की आधिकारिक वेबसाइट। 1915 से सनातन धर्म और राष्ट्र की सेवा।',
  },
  {
    key: 'party_flag_alt_en',
    value: 'ABHM party flag with saffron background, Om symbol, Swastika, lotus flowers and sword',
  },
  {
    key: 'party_flag_alt_hi',
    value: 'ABHM दल ध्वज - भगवा पृष्ठभूमि पर ॐ प्रतीक, स्वस्तिक, कमल पुष्प और खड्ग',
  },
];

const FOCUS_AREAS = [
  {
    id: 'f4a6ad07-e8d8-4a5a-b7ff-9a0f1e6a9001',
    title_en: 'Dharma Raksha',
    title_hi: 'धर्म रक्षा',
    description_en:
      'Protection and promotion of Hindu temples, sacred sites, and religious practices across Uttar Pradesh through legal advocacy and community organizing.',
    description_hi:
      'कानूनी पैरवी और सामुदायिक संगठन के माध्यम से उत्तर प्रदेश में हिन्दू मंदिरों, पवित्र स्थलों और धार्मिक प्रथाओं की सुरक्षा और प्रोत्साहन।',
    icon: '🕉',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'f4a6ad07-e8d8-4a5a-b7ff-9a0f1e6a9002',
    title_en: 'Gau Seva & Raksha',
    title_hi: 'गो सेवा एवं रक्षा',
    description_en:
      'Cow welfare and protection programs including support for gaushaalas, rescue operations, and advocacy for stricter anti-slaughter laws across Uttar Pradesh.',
    description_hi:
      'गोशालाओं के समर्थन, गो-बचाव अभियान और उत्तर प्रदेश में कड़े वध-निरोधक कानूनों की पैरवी सहित गोवंश कल्याण और रक्षा कार्यक्रम।',
    icon: '🐄',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'f4a6ad07-e8d8-4a5a-b7ff-9a0f1e6a9003',
    title_en: 'Vedic Education',
    title_hi: 'वैदिक शिक्षा',
    description_en:
      'Promoting Sanskrit, Vedic sciences, and Gurukul traditions by supporting pathshalas and encouraging students of traditional learning.',
    description_hi:
      'संस्कृत, वैदिक विज्ञान और गुरुकुल परंपराओं का प्रचार करते हुए पाठशालाओं का समर्थन और पारंपरिक शिक्षा के विद्यार्थियों को प्रोत्साहन।',
    icon: '🎓',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'f4a6ad07-e8d8-4a5a-b7ff-9a0f1e6a9004',
    title_en: 'Mandir Suraksha',
    title_hi: 'मंदिर सुरक्षा',
    description_en:
      'Legal aid, advocacy, and community support for Hindu temples and heritage sites, including protection of endowments and management rights.',
    description_hi:
      'हिन्दू मंदिरों और विरासत स्थलों के लिए कानूनी सहायता, पैरवी और सामुदायिक समर्थन, जिसमें धार्मिक न्यासों और प्रबंधन अधिकारों की सुरक्षा शामिल है।',
    icon: '🏛',
    display_order: 4,
    is_active: true,
  },
  {
    id: 'f4a6ad07-e8d8-4a5a-b7ff-9a0f1e6a9005',
    title_en: 'Hindu Sangathan',
    title_hi: 'हिन्दू संगठन',
    description_en:
      'Building unity among all sects, castes, and communities through Sangathan meetings, cultural programs, and district-level outreach.',
    description_hi:
      'संगठन बैठकों, सांस्कृतिक कार्यक्रमों और जिला-स्तरीय जनसंपर्क के माध्यम से सभी पंथों, जातियों और समुदायों में एकता निर्माण।',
    icon: '🤝',
    display_order: 5,
    is_active: true,
  },
  {
    id: 'f4a6ad07-e8d8-4a5a-b7ff-9a0f1e6a9006',
    title_en: 'Seva & Samajseva',
    title_hi: 'सेवा एवं समाजसेवा',
    description_en:
      'Community service programs including health camps, disaster relief, education support, and charitable outreach across Uttar Pradesh.',
    description_hi:
      'स्वास्थ्य शिविर, आपदा राहत, शिक्षा सहयोग और उत्तर प्रदेश में धर्मार्थ जनसेवा कार्यक्रमों के माध्यम से सामुदायिक उत्थान।',
    icon: '🌱',
    display_order: 6,
    is_active: true,
  },
];

/*
Schema mapping note:
- Prompt fields `name`, `role`, and `description` map to `name_en`, `designation_en`, and `bio_en`.
- Prompt fields `slug` and `role_category` are not present in the current `leadership_profiles` schema.
*/
const LEADERSHIP_PROFILES = [
  {
    id: '28c54b94-9d4d-447f-8b3e-2d5f2ea8c001',
    name_en: 'Pandit Madan Mohan Malaviya',
    name_hi: 'पंडित मदन मोहन मालवीय',
    designation_en: 'Co-Founder, ABHM (1915)',
    designation_hi: 'सह-संस्थापक, ABHM (1915)',
    bio_en:
      'One of the early founders of ABHM; a freedom fighter and educationist who played a key role in Hindu consolidation. Also founded Banaras Hindu University (BHU) in 1916. Presided over the first all-India session at Haridwar in 1915.',
    bio_hi:
      'ABHM के प्रारंभिक संस्थापकों में से एक; स्वतंत्रता सेनानी और शिक्षाविद् जिन्होंने हिन्दू एकता में महत्वपूर्ण भूमिका निभाई। 1916 में काशी हिन्दू विश्वविद्यालय (BHU) की स्थापना की।',
    display_order: 1,
    is_active: false,
  },
  {
    id: '28c54b94-9d4d-447f-8b3e-2d5f2ea8c002',
    name_en: 'Vinayak Damodar Savarkar',
    name_hi: 'विनायक दामोदर सावरकर',
    designation_en: 'National President, ABHM (1937-43)',
    designation_hi: 'राष्ट्रीय अध्यक्ष, ABHM (1937-43)',
    bio_en:
      'Former president of ABHM (1937-43); articulated the concept of Hindutva and called to "Hinduize all politics and militarize Hindudom." Spent years imprisoned in the Andaman Cellular Jail for revolutionary activities against British rule.',
    bio_hi:
      'ABHM के राष्ट्रीय अध्यक्ष (1937-43); हिन्दुत्व की अवधारणा को परिभाषित किया और "हिन्दू समाज को सशक्त करो" का आह्वान किया। ब्रिटिश राज के विरुद्ध क्रांतिकारी गतिविधियों के लिए अंडमान सेलुलर जेल में कारावास झेला।',
    display_order: 2,
    is_active: false,
  },
  {
    id: '28c54b94-9d4d-447f-8b3e-2d5f2ea8c003',
    name_en: 'Dr. Shyama Prasad Mukherjee',
    name_hi: 'डॉ. श्यामा प्रसाद मुखर्जी',
    designation_en: 'National President, ABHM (1945-47)',
    designation_hi: 'राष्ट्रीय अध्यक्ष, ABHM (1945-47)',
    bio_en:
      'National President of ABHM (1945-47). Though later associated with Bharatiya Jana Sangh, he had formative connections with ABHM and championed Hindu cultural interests.',
    bio_hi:
      'ABHM के राष्ट्रीय अध्यक्ष (1945-47)। बाद में भारतीय जन संघ से जुड़े, परंतु ABHM से उनका प्रारंभिक वैचारिक संबंध रहा और उन्होंने हिन्दू सांस्कृतिक हितों की पैरवी की।',
    display_order: 3,
    is_active: false,
  },
  {
    id: '28c54b94-9d4d-447f-8b3e-2d5f2ea8c004',
    name_en: 'Lala Lajpat Rai',
    name_hi: 'लाला लाजपत राय',
    designation_en: 'National President, ABHM (1921)',
    designation_hi: 'राष्ट्रीय अध्यक्ष, ABHM (1921)',
    bio_en:
      'Presided over the Akhil Bharat Hindu Mahasabha session in 1921. Associated with nationalist Hindu causes and early ideological influence.',
    bio_hi:
      '1921 में अखिल भारत हिन्दू महासभा के अधिवेशन की अध्यक्षता की। राष्ट्रवादी हिन्दू उद्देश्यों से जुड़े और प्रारंभिक वैचारिक प्रभाव के स्रोत रहे।',
    display_order: 4,
    is_active: false,
  },
  {
    id: '28c54b94-9d4d-447f-8b3e-2d5f2ea8c010',
    name_en: 'Sunil Kumar',
    name_hi: 'सुनील कुमार',
    designation_en: 'Rashtriya Mahamantri (National General Secretary)',
    designation_hi: 'राष्ट्रीय महामंत्री',
    bio_en:
      'Serving as the Rashtriya Mahamantri (National General Secretary) of Akhil Bharat Hindu Mahasabha, with focus on organizational coordination across state units.',
    bio_hi:
      'अखिल भारत हिन्दू महासभा के राष्ट्रीय महामंत्री, जो विभिन्न प्रांतीय इकाइयों में संगठनात्मक समन्वय पर केंद्रित हैं।',
    display_order: 10,
    is_active: true,
  },
  {
    id: '28c54b94-9d4d-447f-8b3e-2d5f2ea8c011',
    name_en: 'Munna Kumar Sharma',
    name_hi: 'मुन्ना कुमार शर्मा',
    designation_en: 'Rashtriya Adhyaksh (National President)',
    designation_hi: 'राष्ट्रीय अध्यक्ष',
    bio_en:
      'Serving as the Rashtriya Adhyaksh (National President) of Akhil Bharat Hindu Mahasabha, leading efforts for Hindu unity and Sanatan Dharma protection.',
    bio_hi:
      'अखिल भारत हिन्दू महासभा के राष्ट्रीय अध्यक्ष, जो हिन्दू एकता और सनातन धर्म संरक्षण के प्रयासों का नेतृत्व कर रहे हैं।',
    display_order: 11,
    is_active: true,
  },
  {
    id: '28c54b94-9d4d-447f-8b3e-2d5f2ea8c012',
    name_en: 'Veeresh Kumar Tyagi',
    name_hi: 'वीरेश कुमार त्यागी',
    designation_en: 'Rashtriya Karyalay Mantri (National Office Secretary)',
    designation_hi: 'राष्ट्रीय कार्यालय मंत्री',
    bio_en:
      'Serving as the Rashtriya Karyalay Mantri (National Office Secretary), overseeing organizational correspondence, records, and national office operations.',
    bio_hi:
      'राष्ट्रीय कार्यालय मंत्री के रूप में संगठनात्मक पत्राचार, अभिलेख और राष्ट्रीय कार्यालय संचालन की देखरेख कर रहे हैं।',
    display_order: 12,
    is_active: true,
  },
];

const NEWS_ARTICLES = [
  {
    slug: 'abhm-up-state-sangathan-meeting-lucknow-2026',
    title_en: 'ABHM UP Holds State-Level Sangathan Meeting in Lucknow',
    title_hi: 'ABHM UP ने लखनऊ में प्रांत-स्तरीय संगठन बैठक आयोजित की',
    excerpt_en:
      'Akhil Bharat Hindu Mahasabha Uttar Pradesh organized a state-level organizational meeting in Lucknow with district leaders from across the state.',
    excerpt_hi:
      'अखिल भारत हिन्दू महासभा उत्तर प्रदेश ने लखनऊ में प्रांत-स्तरीय संगठन बैठक आयोजित की, जिसमें प्रदेश भर के जिला नेता शामिल हुए।',
    body_en:
      '<p>Akhil Bharat Hindu Mahasabha Uttar Pradesh organized a state-level organizational meeting in Lucknow, attended by leaders from districts across the state. The meeting reviewed progress and set organizational priorities for the coming year.</p>',
    body_hi:
      '<p>अखिल भारत हिन्दू महासभा उत्तर प्रदेश ने लखनऊ में प्रांत-स्तरीय संगठन बैठक आयोजित की। बैठक में विभिन्न जिलों के नेता शामिल हुए और आगामी वर्ष की प्राथमिकताओं पर चर्चा हुई।</p>',
    category: 'announcement',
    status: 'published',
    published_at: daysAgo(0),
    meta_title_en: 'ABHM UP State Sangathan Meeting Lucknow 2026',
    meta_title_hi: 'ABHM UP राज्य संगठन बैठक लखनऊ 2026',
    meta_description_en:
      'ABHM UP organized a state-level Sangathan meeting in Lucknow with district leadership participation.',
    meta_description_hi:
      'ABHM UP ने लखनऊ में राज्य स्तर की संगठन बैठक आयोजित की, जिसमें जिला नेतृत्व की भागीदारी रही।',
  },
  {
    slug: 'gau-raksha-mahasammelan-mathura-2026',
    title_en: 'Gau Raksha Mahasammelan Organized in Mathura',
    title_hi: 'मथुरा में गो रक्षा महासम्मेलन का आयोजन',
    excerpt_en:
      'ABHM UP organized a Gau Raksha Mahasammelan in Mathura focused on cow protection and welfare initiatives.',
    excerpt_hi:
      'ABHM UP ने मथुरा में गो संरक्षण और कल्याण पहलों पर केंद्रित गो रक्षा महासम्मेलन आयोजित किया।',
    body_en:
      '<p>Akhil Bharat Hindu Mahasabha Uttar Pradesh organized a Gau Raksha Mahasammelan in Mathura. The gathering highlighted gaushala support, public awareness, and legal advocacy for cow protection.</p>',
    body_hi:
      '<p>अखिल भारत हिन्दू महासभा उत्तर प्रदेश ने मथुरा में गो रक्षा महासम्मेलन आयोजित किया, जिसमें गोशाला सहयोग, जनजागरूकता और कानूनी पैरवी पर जोर दिया गया।</p>',
    category: 'event',
    status: 'published',
    published_at: daysAgo(7),
    meta_title_en: 'Gau Raksha Mahasammelan Mathura 2026',
    meta_title_hi: 'गो रक्षा महासम्मेलन मथुरा 2026',
    meta_description_en:
      'ABHM UP hosted a Gau Raksha Mahasammelan in Mathura to strengthen cow protection initiatives.',
    meta_description_hi:
      'ABHM UP ने मथुरा में गो रक्षा महासम्मेलन आयोजित कर गो संरक्षण पहलों को मजबूत करने पर बल दिया।',
  },
  {
    slug: 'vedic-education-scholarship-2026',
    title_en: 'Vedic Education Scholarship Program 2026 - Applications Open',
    title_hi: 'वैदिक शिक्षा छात्रवृत्ति कार्यक्रम 2026 - आवेदन आमंत्रित',
    excerpt_en:
      'ABHM UP announces scholarships for Sanskrit and Vedic learning students across Uttar Pradesh.',
    excerpt_hi:
      'ABHM UP ने उत्तर प्रदेश के संस्कृत और वैदिक अध्ययन के विद्यार्थियों के लिए छात्रवृत्ति की घोषणा की।',
    body_en:
      '<p>Akhil Bharat Hindu Mahasabha Uttar Pradesh announced its 2026 Vedic Education Scholarship Program. Applications are invited from students pursuing Sanskrit and traditional Vedic learning across Uttar Pradesh.</p>',
    body_hi:
      '<p>अखिल भारत हिन्दू महासभा उत्तर प्रदेश ने 2026 वैदिक शिक्षा छात्रवृत्ति कार्यक्रम की घोषणा की है। संस्कृत और वैदिक अध्ययन करने वाले विद्यार्थियों से आवेदन आमंत्रित हैं।</p>',
    category: 'announcement',
    status: 'published',
    published_at: daysAgo(14),
    meta_title_en: 'Vedic Education Scholarship 2026 | ABHM UP',
    meta_title_hi: 'वैदिक शिक्षा छात्रवृत्ति 2026 | ABHM UP',
    meta_description_en:
      'Applications are open for ABHM UP Vedic Education Scholarship Program 2026.',
    meta_description_hi:
      'ABHM UP वैदिक शिक्षा छात्रवृत्ति कार्यक्रम 2026 के लिए आवेदन खुले हैं।',
  },
];

const EVENTS = [
  {
    slug: 'up-state-convention-lucknow-2026',
    title_en: 'UP State Convention 2026',
    title_hi: 'उ.प्र. राज्य सम्मेलन 2026',
    description_en:
      '<p>Annual state convention in Lucknow bringing together district representatives and office bearers.</p>',
    description_hi:
      '<p>लखनऊ में आयोजित वार्षिक राज्य सम्मेलन जिसमें जिला प्रतिनिधि और पदाधिकारी शामिल होंगे।</p>',
    event_date: daysFromNow(90),
    event_time: '10:00 AM',
    location_en: 'ABHM Bhawan, Lucknow',
    location_hi: 'ABHM भवन, लखनऊ',
    status: 'published',
  },
  {
    slug: 'vedic-education-workshop-prayagraj-2026',
    title_en: 'Vedic Education Workshop',
    title_hi: 'वैदिक शिक्षा कार्यशाला',
    description_en:
      '<p>Workshop for teachers on integrating Vedic teachings into contemporary learning frameworks.</p>',
    description_hi:
      '<p>शिक्षकों के लिए कार्यशाला, जिसमें आधुनिक शिक्षण ढांचे में वैदिक शिक्षाओं के समावेश पर चर्चा होगी।</p>',
    event_date: daysFromNow(30),
    event_time: '9:00 AM',
    location_en: 'Prayagraj',
    location_hi: 'प्रयागराज',
    status: 'published',
  },
  {
    slug: 'hindu-sangathan-district-sammelan-kanpur-2026',
    title_en: 'Hindu Sangathan District Sammelan',
    title_hi: 'हिन्दू संगठन जिला सम्मेलन',
    description_en:
      '<p>District-level Sangathan program to strengthen local volunteer networks and dharmic outreach activities.</p>',
    description_hi:
      '<p>स्थानीय कार्यकर्ता नेटवर्क और धार्मिक जनजागरण कार्यक्रमों को मजबूत करने हेतु जिला-स्तरीय संगठन सम्मेलन।</p>',
    event_date: daysFromNow(55),
    event_time: '11:30 AM',
    location_en: 'Kanpur',
    location_hi: 'कानपुर',
    status: 'published',
  },
];

async function seedSiteSettings() {
  const { error } = await supabase
    .from('site_settings')
    .upsert(SITE_SETTINGS, { onConflict: 'key' });

  if (error) throw new Error(`site_settings seed failed: ${error.message}`);
  console.log(`  OK site_settings: ${SITE_SETTINGS.length}`);
}

async function seedFocusAreas() {
  const { error } = await supabase
    .from('focus_areas')
    .upsert(FOCUS_AREAS, { onConflict: 'id' });

  if (error) throw new Error(`focus_areas seed failed: ${error.message}`);
  console.log(`  OK focus_areas: ${FOCUS_AREAS.length}`);
}

async function seedLeadershipProfiles() {
  const { error } = await supabase
    .from('leadership_profiles')
    .upsert(LEADERSHIP_PROFILES, { onConflict: 'id' });

  if (error) throw new Error(`leadership_profiles seed failed: ${error.message}`);
  console.log(`  OK leadership_profiles: ${LEADERSHIP_PROFILES.length}`);
}

async function seedNewsArticles() {
  const { error } = await supabase
    .from('news_articles')
    .upsert(NEWS_ARTICLES, { onConflict: 'slug' });

  if (error) throw new Error(`news_articles seed failed: ${error.message}`);
  console.log(`  OK news_articles: ${NEWS_ARTICLES.length}`);
}

async function seedEvents() {
  const { error } = await supabase
    .from('events')
    .upsert(EVENTS, { onConflict: 'slug' });

  if (error) throw new Error(`events seed failed: ${error.message}`);
  console.log(`  OK events: ${EVENTS.length}`);
}

async function seed() {
  console.log('Seeding ABHM UP database with verified content...\n');

  await seedSiteSettings();
  await seedFocusAreas();
  await seedLeadershipProfiles();
  await seedNewsArticles();
  await seedEvents();

  console.log('\nSeeding complete.');
}

seed().catch((error) => {
  console.error('\nSeed failed.');
  console.error(error);
  process.exit(1);
});
