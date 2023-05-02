import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/english.json';

const resources = {
  en: { translation: en },
};

const I18NOptions = {
  compatibilityJSON: 'v3',
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false,
  },
};

const configureReactI18next = () => {
  i18next.use(initReactI18next).init(I18NOptions);
  return i18next;
};

export default configureReactI18next;
