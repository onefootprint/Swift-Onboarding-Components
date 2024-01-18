import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './english.json';

const configureI18n = () => {
  const i18nOptions = {
    lng: 'en',
    interpolation: { escapeValue: false },
    resources: { en: { translation: en } },
  };

  i18next.use(initReactI18next).init(i18nOptions);
  return i18next;
};

export default configureI18n;
