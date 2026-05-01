-- ============================================================
-- Migration: Seed cms_content with all editable site text
-- Prerequisites: cms_content table (from 20260417020000)
-- Idempotent: ON CONFLICT (key) DO NOTHING — safe to re-run
-- ============================================================

INSERT INTO public.cms_content (key, value, type, label, section, description) VALUES

-- ===================== HERO SECTION =====================
('hero:title_line1:text_en',    'Akhil Bharat Hindu',                            'text',      'Hero Title Line 1 (EN)',    'hero',    'First line of main headline'),
('hero:title_line2:text_en',    'Mahasabha',                                     'text',      'Hero Title Line 2 (EN)',    'hero',    'Second line — displays in saffron'),
('hero:title_line1:text_hi',    'अखिल भारत हिन्दू',                              'text_hi',   'Hero Title Line 1 (HI)',    'hero',    'Hindi headline line 1'),
('hero:title_line2:text_hi',    'महासभा',                                         'text_hi',   'Hero Title Line 2 (HI)',    'hero',    'Hindi headline line 2 — saffron'),
('hero:tagline:text_en',        'Serving Sanatan Dharma and the nation with unwavering dedication since 1915. Rooted in the Vedic tradition of Uttar Pradesh.', 'text', 'Hero Tagline (EN)', 'hero', ''),
('hero:tagline:text_hi',        '1915 से सनातन धर्म और राष्ट्र की अटूट निष्ठा के साथ सेवा। उत्तर प्रदेश की वैदिक परंपरा में निहित।', 'text_hi', 'Hero Tagline (HI)', 'hero', ''),
('hero:cta_primary:text_en',    'Our Mission',                                   'text',      'Primary CTA Button (EN)',   'hero',    ''),
('hero:cta_primary:text_hi',    'हमारा मिशन',                                    'text_hi',   'Primary CTA Button (HI)',   'hero',    ''),
('hero:cta_secondary:text_en',  'Latest News',                                   'text',      'Secondary CTA Button (EN)', 'hero',    ''),
('hero:cta_secondary:text_hi',  'ताज़ा खबर',                                      'text_hi',   'Secondary CTA Button (HI)', 'hero',    ''),
('hero:stat_founded:value',     '1915',                                          'text',      'Founded Year Stat',         'hero',    'Shown in stats row'),
('hero:stat_districts:value',   '75',                                            'number',    'Districts Count',           'hero',    ''),
('hero:stat_members:value',     '5L+',                                           'text',      'Members Count',             'hero',    ''),
('hero:stat_mandals:value',     '500+',                                          'text',      'Mandals Count',             'hero',    ''),
('hero:eyebrow:text_en',        'OFFICIAL UTTAR PRADESH UNIT',                   'text',      'Eyebrow Badge Text (EN)',   'hero',    ''),
('hero:eyebrow:text_hi',        'उत्तर प्रदेश आधिकारिक इकाई',                    'text_hi',   'Eyebrow Badge Text (HI)',   'hero',    ''),
('hero:background_image:url',   '',                                              'image_url', 'Hero Background Image',     'hero',    'Optional full-bleed background image URL'),

-- ===================== ABOUT SECTION =====================
('about:heading:text_en',       'Protectors of Sanatan Dharma Since 1915',       'text',      'About Heading (EN)',        'about',   ''),
('about:heading:text_hi',       '1915 से सनातन धर्म के संरक्षक',                  'text_hi',   'About Heading (HI)',        'about',   ''),
('about:body:text_en',          'Akhil Bharat Hindu Mahasabha was formally established in April 1915 at the Kumbh Mela in Haridwar. The Uttar Pradesh unit encompasses all 75 districts and has been at the forefront of cultural preservation, cow protection, Vedic education, and national integration.', 'richtext', 'About Body (EN)', 'about', ''),
('about:body:text_hi',          'अखिल भारत हिन्दू महासभा औपचारिक रूप से अप्रैल 1915 में हरिद्वार के कुंभ मेले में स्थापित हुई। उत्तर प्रदेश इकाई सभी 75 जिलों को समेटती है।', 'text_hi', 'About Body (HI)', 'about', ''),
('about:founded_year:text',     '1915',                                          'text',      'Founded Year Badge',        'about',   'Year shown in the badge'),
('about:image:url',             '',                                              'image_url', 'About Section Image',       'about',   'Main about section image (replaces lotus SVG)'),

-- ===================== FOCUS AREAS SECTION =====================
('focus:heading:text_en',       'Focus Areas',                                   'text',      'Focus Areas Heading (EN)',  'focus',   ''),
('focus:heading:text_hi',       'कार्यक्षेत्र',                                   'text_hi',   'Focus Areas Heading (HI)',  'focus',   ''),
('focus:subheading:text_en',    'Our Work',                                      'text',      'Focus Areas Eyebrow (EN)',  'focus',   ''),

-- ===================== JOIN/CTA SECTION =====================
('join:heading:text_en',        'Become a Member of ABHM UP',                    'text',      'Join Heading (EN)',         'join',    ''),
('join:heading:text_hi',        'ABHM UP के सदस्य बनें',                          'text_hi',   'Join Heading (HI)',         'join',    ''),
('join:body:text_en',           'Join thousands of dedicated members working for the preservation of Sanatan Dharma, cow protection, and national integrity across Uttar Pradesh.', 'text', 'Join Body (EN)', 'join', ''),
('join:body:text_hi',           'हजारों समर्पित सदस्यों के साथ जुड़ें जो उत्तर प्रदेश में सनातन धर्म की रक्षा के लिए कार्य कर रहे हैं।', 'text_hi', 'Join Body (HI)', 'join', ''),
('join:form_title:text_en',     'Membership Application',                        'text',      'Form Title (EN)',           'join',    ''),
('join:form_subtitle:text_en',  'Fill the form and we will contact you shortly', 'text',      'Form Subtitle (EN)',        'join',    ''),
('join:contact_phone:text',     '+91 9999-888-777',                              'text',      'Contact Phone',             'join',    ''),
('join:contact_email:text',     'info@abhm-up.org',                              'text',      'Contact Email',             'join',    ''),
('join:contact_address:text_en','ABHM Bhawan, Hazratganj, Lucknow, UP 226001',  'text',      'Address (EN)',              'join',    ''),
('join:contact_address:text_hi','ABHM भवन, हजरतगंज, लखनऊ, उ.प्र. 226001',      'text_hi',   'Address (HI)',              'join',    ''),

-- ===================== NAVIGATION =====================
('nav:home:text_en',            'Home',                                          'text',      'Nav: Home (EN)',            'nav',     ''),
('nav:home:text_hi',            'होम',                                            'text_hi',   'Nav: Home (HI)',            'nav',     ''),
('nav:about:text_en',           'About',                                         'text',      'Nav: About (EN)',           'nav',     ''),
('nav:about:text_hi',           'परिचय',                                          'text_hi',   'Nav: About (HI)',           'nav',     ''),
('nav:leadership:text_en',      'Leadership',                                    'text',      'Nav: Leadership (EN)',      'nav',     ''),
('nav:leadership:text_hi',      'नेतृत्व',                                        'text_hi',   'Nav: Leadership (HI)',      'nav',     ''),
('nav:news:text_en',            'News',                                          'text',      'Nav: News (EN)',            'nav',     ''),
('nav:news:text_hi',            'समाचार',                                         'text_hi',   'Nav: News (HI)',            'nav',     ''),
('nav:events:text_en',          'Events',                                        'text',      'Nav: Events (EN)',          'nav',     ''),
('nav:events:text_hi',          'आयोजन',                                          'text_hi',   'Nav: Events (HI)',          'nav',     ''),
('nav:join_btn:text_en',        'Join Us',                                       'text',      'Join Button Label (EN)',    'nav',     ''),
('nav:join_btn:text_hi',        'जुड़ें',                                          'text_hi',   'Join Button Label (HI)',    'nav',     ''),

-- ===================== FOOTER =====================
('footer:tagline:text_en',      'Serving Sanatan Dharma and the nation since 1915.', 'text',  'Footer Tagline (EN)',       'footer',  ''),
('footer:tagline:text_hi',      '1915 से सनातन धर्म और राष्ट्र की सेवा में।',      'text_hi', 'Footer Tagline (HI)',       'footer',  ''),
('footer:shloka:text',          'धर्मो रक्षति रक्षितः',                             'text_hi', 'Sanskrit Shloka',           'footer',  'Shown in footer in gold'),
('footer:copyright:text_en',    '© 2026 Akhil Bharat Hindu Mahasabha (U.P.) All rights reserved.', 'text', 'Copyright Text', 'footer', ''),

-- ===================== GLOBAL BRAND =====================
('brand:site_name:text_en',     'Akhil Bharat Hindu Mahasabha',                  'text',      'Site Name (EN)',            'brand',   ''),
('brand:site_name:text_hi',     'अखिल भारत हिन्दू महासभा',                        'text_hi',   'Site Name (HI)',            'brand',   ''),
('brand:unit_name:text_en',     'Uttar Pradesh',                                 'text',      'Unit Name (EN)',            'brand',   ''),
('brand:tagline_short:text_en', 'Since 1915',                                    'text',      'Short Tagline',             'brand',   ''),
('brand:logo_image:url',        '',                                              'image_url', 'Logo Image URL',            'brand',   'Override the default OM emblem with an image')

ON CONFLICT (key) DO NOTHING;
