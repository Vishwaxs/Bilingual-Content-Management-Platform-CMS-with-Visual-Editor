import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (en: string, hi: string) => string;
  field: <T>(obj: T, fieldName: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'abhm-lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'en' || stored === 'hi') ? stored : 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback((en: string, hi: string) => {
    return language === 'en' ? en : hi;
  }, [language]);

  const field = useCallback(<T,>(obj: T, fieldName: string): string => {
    const key = `${fieldName}_${language}` as keyof T;
    return (obj[key] as string) || (obj[`${fieldName}_en` as keyof T] as string) || '';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t, field }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
