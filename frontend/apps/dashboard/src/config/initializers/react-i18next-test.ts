import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/all.json';
import businesses from '../locales/en/businesses.json';
import domainRestrictions from '../locales/en/domain-restrictions.json';
import superAdmin from '../locales/en/super-admin.json';
import users from '../locales/en/users.json';

const resources = {
  en: {
    'domain-restrictions': domainRestrictions,
    'super-admin': superAdmin,
    businesses,
    default: en,
    users,
  },
};
const I18NOptions = {
  resources,
  lng: 'en',
  defaultNS: 'default',
  ns: ['default', 'super-admin', 'users', 'businesses', 'domain-restrictions'],
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
};

i18next.use(initReactI18next).init(I18NOptions);
