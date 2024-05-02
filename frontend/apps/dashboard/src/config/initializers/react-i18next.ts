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
import users from '../locales/en/users.json';

const configureReactI18next = () => {
  i18next.use(initReactI18next).init({
    resources: {
      en: {
        common,
        authentication,
        businesses,
        internal,
        lists,
        users,
        'entity-documents': entityDocuments,
        'entity-details': entityDetails,
        'domain-restrictions': domainRestrictions,
        ui,
        playbooks,
      },
    },
    lng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'authentication',
      'businesses',
      'internal',
      'lists',
      'users',
      'entity-documents',
      'entity-details',
      'domain-restrictions',
      'ui',
      'playbooks',
    ],
    returnNull: false,
    interpolation: {
      escapeValue: false,
    },
  });
  return i18next;
};

export default configureReactI18next;
