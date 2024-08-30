import { enIdentifyJson, enIdvJson, esIdentifyJson, esIdvJson } from '@onefootprint/idv';
import { enRequestJson, esRequestJson } from '@onefootprint/request';
import { enUiJson, esUiJson } from '@onefootprint/ui';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommonJson from '../locales/en/common.json';
import esCommonJson from '../locales/es/common.json';

const configureI18n = ({ language }: { language: string }) => {
  i18next.use(initReactI18next).init({
    lng: language,
    resources: {
      en: {
        common: enCommonJson,
        idv: enIdvJson,
        ui: enUiJson,
        request: enRequestJson,
        identify: enIdentifyJson,
      },
      es: {
        common: esCommonJson,
        idv: esIdvJson,
        ui: esUiJson,
        request: esRequestJson,
        identify: esIdentifyJson,
      },
    },
    debug: false,
    defaultNS: 'common',
    ns: ['common', 'ui', 'idv', 'request'],
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    detection: {
      order: ['querystring', 'navigator'],
      lookupQuerystring: 'lng',
    },
    react: {
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      useSuspense: false,
    },
    returnNull: false,
  });

  i18next.services.formatter?.add('capitalize', value => `${value.charAt(0).toUpperCase()}${value.slice(1)}`);

  i18next.services.formatter?.add('allCaps', value => value.toUpperCase());

  return i18next;
};

export default configureI18n;
