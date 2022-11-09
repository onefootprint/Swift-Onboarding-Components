import i18next from 'i18next';

import en from '../locales/english.json';

const configureI18next = () =>
  i18next.createInstance(
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

export default configureI18next;
