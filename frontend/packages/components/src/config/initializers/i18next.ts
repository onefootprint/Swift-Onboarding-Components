import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../locales/en/common.json';

const configureI18n = () => {
  i18next.use(initReactI18next).init({
    resources: {
      en: {
        common: enCommon,
      },
    },
    defaultNS: 'common',
    lng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: 'en',
    supportedLngs: ['en'],
    returnNull: false,
  });

  return i18next;
};

export default configureI18n;
