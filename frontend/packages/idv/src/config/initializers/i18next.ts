import i18next from 'i18next';

import en from '../locales/english.json';
import es from '../locales/spanish.json';

const configureI18next = (initialLanguage = 'en') => {
  const i18nextInstance = i18next.createInstance(
    {
      resources: {
        en: { translation: en },
        es: { translation: es },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    },
    err => {
      if (err) {
        console.warn(err);
      }
    },
  );

  i18nextInstance.services.formatter?.add(
    'capitalize',
    value => `${value.charAt(0).toUpperCase()}${value.slice(1)}`,
  );

  i18nextInstance.services.formatter?.add('allCaps', value =>
    value.toUpperCase(),
  );

  return i18nextInstance;
};

export default configureI18next;
