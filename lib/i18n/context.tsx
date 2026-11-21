'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

export type Language = 'en' | 'hi';

type Translations = typeof en;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isHindi: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en,
  hi: hi as unknown as Translations,
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('cleanbreath_lang') as Language;
      if (savedLang === 'en' || savedLang === 'hi') {
        setLanguageState(savedLang);
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('cleanbreath_lang', lang);
    } catch {
      // Ignore
    }
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    isHindi: language === 'hi',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: en,
      isHindi: false,
    };
  }
  return context;
};
