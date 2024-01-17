import i18n from 'i18next';

import en from '../locales/en/idv.json';
import es from '../locales/es/idv.json';

const IS_DEV = process.env.NODE_ENV === 'development';

i18n.createInstance({
  debug: IS_DEV,
  fallbackLng: 'en',
  defaultNS: 'idv',
  ns: ['idv', 'ui'],
  interpolation: { escapeValue: false }, // not needed for react as it escapes by default
  react: { useSuspense: false },
  supportedLngs: ['en', 'es'],
  resources: {
    en: {
      idv: en,
    },
    es: {
      idv: es,
    },
  },
});

export default i18n;
