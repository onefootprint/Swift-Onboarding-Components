import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import request from '../locales/en/request.json';

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: 'en',
  defaultNS: 'request',
  ns: ['request'],
  interpolation: { escapeValue: false }, // not needed for react as it escapes by default
  react: { useSuspense: false },
  supportedLngs: ['en'],
  resources: {
    en: {
      request,
    },
  },
});

export default i18n;
