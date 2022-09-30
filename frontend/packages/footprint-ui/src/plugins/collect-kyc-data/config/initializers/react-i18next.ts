import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/english.json';

const configureReactI18next = () => {
  const resources = {
    en: { translation: en },
  };

  const I18NOptions = {
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
  };

  i18next.use(initReactI18next).init(I18NOptions);
  return i18next;
};

export default configureReactI18next;
