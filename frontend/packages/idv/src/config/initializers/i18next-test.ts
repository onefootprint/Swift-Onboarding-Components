import { enUiJson as ui } from '@onefootprint/ui';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import idv from '../locales/en/idv.json';

const IS_DEV = process.env.NODE_ENV === 'development';

i18n.use(initReactI18next).init({
  debug: IS_DEV,
  fallbackLng: 'en',
  defaultNS: 'idv',
  ns: ['idv', 'ui'],
  interpolation: { escapeValue: false }, // not needed for react as it escapes by default
  react: { useSuspense: false },
  supportedLngs: ['en'],
  resources: {
    en: {
      idv,
      ui,
    },
  },
});

i18n.services.formatter?.add(
  'capitalize',
  value => `${value.charAt(0).toUpperCase()}${value.slice(1)}`,
);

i18n.services.formatter?.add('allCaps', value => value.toUpperCase());

export default i18n;
