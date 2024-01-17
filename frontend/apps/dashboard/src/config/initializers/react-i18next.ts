import { enUiJson as ui } from '@onefootprint/ui';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/all.json';
import businesses from '../locales/en/businesses.json';
import domainRestrictions from '../locales/en/domain-restrictions.json';
import internal from '../locales/en/internal.json';
import users from '../locales/en/users.json';

const configureReactI18next = () => {
  i18next.use(initReactI18next).init({
    resources: {
      en: {
        default: en,
        businesses,
        internal,
        users,
        'domain-restrictions': domainRestrictions,
        ui,
      },
    },
    lng: 'en',
    defaultNS: 'default',
    ns: [
      'default',
      'businesses',
      'internal',
      'users',
      'domain-restrictions',
      'ui',
    ],
    returnNull: false,
    interpolation: {
      escapeValue: false,
    },
  });
  return i18next;
};

export default configureReactI18next;
