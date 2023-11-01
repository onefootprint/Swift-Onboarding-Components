import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/all.json';
import businesses from '../locales/en/businesses.json';
import superAdmin from '../locales/en/super-admin.json';
import users from '../locales/en/users.json';

const configureReactI18next = () => {
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
    ns: ['default', 'businesses', 'super-admin', 'users'],
    returnNull: false,
    interpolation: {
      escapeValue: false,
    },
  };

  i18next.use(initReactI18next).init(I18NOptions);
  return i18next;
};

export default configureReactI18next;
