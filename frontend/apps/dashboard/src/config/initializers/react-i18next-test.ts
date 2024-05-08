import { enUiJson as ui } from '@onefootprint/ui';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import authentication from '../locales/en/authentication.json';
import businesses from '../locales/en/businesses.json';
import common from '../locales/en/common.json';
import domainRestrictions from '../locales/en/domain-restrictions.json';
import entityDetails from '../locales/en/entity-details.json';
import entityDocuments from '../locales/en/entity-documents.json';
import internal from '../locales/en/internal.json';
import lists from '../locales/en/lists.json';
import playbooks from '../locales/en/playbooks.json';
import switchOrg from '../locales/en/switch-org.json';
import users from '../locales/en/users.json';

i18next.use(initReactI18next).init({
  resources: {
    en: {
      'domain-restrictions': domainRestrictions,
      'entity-details': entityDetails,
      'entity-documents': entityDocuments,
      'switch-org': switchOrg,
      authentication,
      businesses,
      common,
      internal,
      lists,
      playbooks,
      ui,
      users,
    },
  },
  lng: 'en',
  defaultNS: 'common',
  ns: [
    'authetication',
    'businesses',
    'common',
    'domain-restrictions',
    'entity-details',
    'entity-documents',
    'internal',
    'lists',
    'playbooks',
    'switch-org',
    'ui',
    'users',
  ],
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
});
