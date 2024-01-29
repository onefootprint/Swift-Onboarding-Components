import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { COMMIT_SHA } from '../constants';

const IS_BROWSER = typeof window !== 'undefined';

const configureI18n = () => {
  i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      debug: false,
      defaultNS: 'common',
      ns: ['common', 'ui', 'idv'],
      interpolation: {
        escapeValue: false,
      },
      fallbackLng: 'en',
      supportedLngs: ['en', 'es'],
      backend: IS_BROWSER
        ? {
            loadPath: `/locales/{{lng}}/{{ns}}.json?v=${COMMIT_SHA}`,
            requestOptions: {
              cache: 'no-store',
              credentials: 'same-origin',
              mode: 'no-cors',
            },
          }
        : undefined,
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

  i18next.services.formatter?.add(
    'capitalize',
    value => `${value.charAt(0).toUpperCase()}${value.slice(1)}`,
  );

  i18next.services.formatter?.add('allCaps', value => value.toUpperCase());

  return i18next;
};

export default configureI18n;
