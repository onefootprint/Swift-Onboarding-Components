import type { SupportedLanguage } from '@onefootprint/types';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/common.json';
import es from '../locales/es/common.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const configureReactI18next = (lng: SupportedLanguage = 'en') => {
  i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng,
    interpolation: {
      escapeValue: false,
    },
  });
  return i18next;
};

export default configureReactI18next;
