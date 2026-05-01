export const translations = {
  nav: {
    home: { en: 'Home', hi: 'मुखपृष्ठ' },
    about: { en: 'About', hi: 'हमारे बारे में' },
    leadership: { en: 'Leadership', hi: 'नेतृत्व' },
    news: { en: 'News', hi: 'समाचार' },
    events: { en: 'Events', hi: 'कार्यक्रम' },
    contact: { en: 'Contact', hi: 'संपर्क' },
    join: { en: 'Join Us', hi: 'जुड़ें' },
  },
  hero: {
    title: {
      en: 'Akhil Bharatiya Hindu Mahasabha',
      hi: 'अखिल भारतीय हिन्दू महासभा',
    },
    subtitle: {
      en: 'Serving the Nation with Dedication and Integrity',
      hi: 'समर्पण और ईमानदारी से राष्ट्र की सेवा',
    },
    cta: { en: 'Learn More', hi: 'और जानें' },
  },
  sections: {
    leadership: { en: 'Our Leadership', hi: 'हमारा नेतृत्व' },
    latestNews: { en: 'Latest News', hi: 'ताज़ा समाचार' },
    upcomingEvents: { en: 'Upcoming Events', hi: 'आगामी कार्यक्रम' },
    readMore: { en: 'Read More', hi: 'और पढ़ें' },
    viewAll: { en: 'View All', hi: 'सभी देखें' },
  },
  cta: {
    title: { en: 'Join the Movement', hi: 'आंदोलन से जुड़ें' },
    subtitle: {
      en: 'Be a part of building a stronger nation.',
      hi: 'एक मजबूत राष्ट्र के निर्माण का हिस्सा बनें।',
    },
    joinBtn: { en: 'Join Now', hi: 'अभी जुड़ें' },
    contactBtn: { en: 'Contact Us', hi: 'संपर्क करें' },
  },
  about: {
    title: { en: 'About the Party', hi: 'पार्टी के बारे में' },
    history: {
      en: 'Akhil Bharatiya Hindu Mahasabha is a historic political organization dedicated to the cultural and political empowerment of the Hindu community. Founded with a vision of national unity and cultural renaissance, the party continues to work for the welfare of the nation.',
      hi: 'अखिल भारतीय हिन्दू महासभा एक ऐतिहासिक राजनीतिक संगठन है जो हिंदू समुदाय के सांस्कृतिक और राजनीतिक सशक्तिकरण के लिए समर्पित है। राष्ट्रीय एकता और सांस्कृतिक पुनर्जागरण की दृष्टि से स्थापित, पार्टी राष्ट्र के कल्याण के लिए काम करती रहती है।',
    },
    mission: {
      en: 'Our mission is to uphold the values of dharma, unity, and progress while working towards a prosperous and strong India.',
      hi: 'हमारा मिशन धर्म, एकता और प्रगति के मूल्यों को बनाए रखते हुए एक समृद्ध और मजबूत भारत की दिशा में काम करना है।',
    },
  },
  footer: {
    tagline: {
      en: 'Working for a stronger and united India.',
      hi: 'एक मजबूत और एकजुट भारत के लिए कार्यरत।',
    },
    quickLinks: { en: 'Quick Links', hi: 'त्वरित लिंक' },
    contactInfo: { en: 'Contact', hi: 'संपर्क' },
    rights: { en: 'All rights reserved.', hi: 'सर्वाधिकार सुरक्षित।' },
  },
  admin: {
    dashboard: 'Dashboard',
    news: 'News',
    leadership: 'Leadership',
    settings: 'Settings',
    logout: 'Logout',
  },
} as const;

export type TranslationKey = keyof typeof translations;
