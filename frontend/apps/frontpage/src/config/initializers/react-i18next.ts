import { enUiJson as ui } from '@onefootprint/ui';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '../locales/en/common.json';

const configureReactI18next = () => {
  i18next.use(initReactI18next).init({
    resources: {
      en: {
        common,
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
