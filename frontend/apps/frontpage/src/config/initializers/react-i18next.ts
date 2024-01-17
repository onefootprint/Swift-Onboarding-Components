import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../../public/locales/en/common.json';
import ui from '../../../public/locales/en/ui.json';

const configureReactI18next = () => {
  i18next.use(initReactI18next).init({
    resources: {
      en: {
        common: en,
        ui,
      },
    },
    lng: 'en',
    defaultNS: 'common',
    ns: ['common', 'ui'],
    returnNull: false,
    interpolation: {
      escapeValue: false,
    },
  });

  return i18next;
};

export default configureReactI18next;
