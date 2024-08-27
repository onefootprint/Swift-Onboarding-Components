import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

import en from '../src/config/locales/en/ui.json';
import es from '../src/config/locales/es/ui.json';

i18n.use(initReactI18next).init({
  debug: true,
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

// When The language changes, set the document direction
i18n.on('languageChanged', locale => {
  const direction = i18n.dir(locale);
  document.dir = direction;
});

export default i18n;
