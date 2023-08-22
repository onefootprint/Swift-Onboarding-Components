import i18next from 'i18next';

import en from '../locales/english.json';

const configureI18next = () => {
  const i18nextInstance = i18next.createInstance(
    {
      resources: {
        en: { translation: en },
      },
      lng: 'en',
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

  return i18nextInstance;
};

export default configureI18next;
