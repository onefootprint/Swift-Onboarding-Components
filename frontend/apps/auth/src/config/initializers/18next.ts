import { enIdentifyJson, enIdvJson, esIdentifyJson, esIdvJson } from '@onefootprint/idv';
import { enRequestJson, esRequestJson } from '@onefootprint/request';
import { enUiJson, esUiJson } from '@onefootprint/ui';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommonJson from '../locales/en/common.json';
import esCommonJson from '../locales/es/common.json';

const configureI18n = () => {
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          common: enCommonJson,
          identify: enIdentifyJson,
          idv: enIdvJson,
          request: enRequestJson,
          ui: enUiJson,
        },
        es: {
          common: esCommonJson,
          identify: esIdentifyJson,
          idv: esIdvJson,
          request: esRequestJson,
          ui: esUiJson,
        },
      },
      debug: false,
      defaultNS: 'common',
      ns: ['common', 'ui', 'idv', 'request', 'identify'],
      interpolation: { escapeValue: false },
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
    });

  i18next.services.formatter?.add('capitalize', value => `${value.charAt(0).toUpperCase()}${value.slice(1)}`);

  i18next.services.formatter?.add('allCaps', value => value.toUpperCase());

  return i18next;
};

export default configureI18n;
