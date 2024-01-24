import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/ui.json';

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: 'en',
  defaultNS: 'ui',
  ns: ['ui'],
  interpolation: { escapeValue: false }, // not needed for react as it escapes by default
  react: { useSuspense: false },
  supportedLngs: ['en'],
  resources: {
    en: {
      ui: en,
    },
  },
});

export default i18n;
