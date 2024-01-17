import i18n from 'i18next';

import en from '../locales/en/ui.json';
import es from '../locales/es/ui.json';

const IS_DEV = process.env.NODE_ENV === 'development';

i18n.createInstance({
  debug: IS_DEV,
  fallbackLng: 'en',
  defaultNS: 'ui',
  ns: ['ui'],
  interpolation: { escapeValue: false }, // not needed for react as it escapes by default
  react: { useSuspense: false },
  supportedLngs: ['en', 'es'],
  resources: {
    en: {
      ui: en,
    },
    es: {
      ui: es,
    },
  },
});

export default i18n;
