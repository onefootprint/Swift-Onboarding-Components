import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/ui.json';

const IS_DEV = process.env.NODE_ENV === 'development';

i18n.use(initReactI18next).init({
  debug: IS_DEV,
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
