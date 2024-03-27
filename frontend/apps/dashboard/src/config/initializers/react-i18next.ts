import { enUiJson as ui } from '@onefootprint/ui';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import businesses from '../locales/en/businesses.json';
import common from '../locales/en/common.json';
import domainRestrictions from '../locales/en/domain-restrictions.json';
import internal from '../locales/en/internal.json';
import lists from '../locales/en/lists.json';
import users from '../locales/en/users.json';

const configureReactI18next = () => {
  i18next.use(initReactI18next).init({
    resources: {
      en: {
        common,
        businesses,
        internal,
        lists,
        users,
        'domain-restrictions': domainRestrictions,
        ui,
      },
    },
    lng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'businesses',
      'internal',
      'lists',
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
