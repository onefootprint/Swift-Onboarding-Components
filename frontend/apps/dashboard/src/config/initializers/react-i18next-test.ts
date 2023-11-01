import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/all.json';
import businesses from '../locales/en/businesses.json';
import superAdmin from '../locales/en/super-admin.json';
import users from '../locales/en/users.json';

const resources = {
  en: {
    default: en,
    users,
    businesses,
    'super-admin': superAdmin,
  },
};
const I18NOptions = {
  resources,
  lng: 'en',
  defaultNS: 'default',
  ns: ['default', 'super-admin', 'users', 'businesses'],
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
};

i18next.use(initReactI18next).init(I18NOptions);
