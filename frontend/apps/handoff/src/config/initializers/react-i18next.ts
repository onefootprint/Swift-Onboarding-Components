import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/english.json';
import es from '../locales/spanish.json';

const configureReactI18next = (initialLanguage = 'en') => {
  const I18NOptions = {
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  };

  i18next.use(initReactI18next).init(I18NOptions);
  return i18next;
};

export default configureReactI18next;
