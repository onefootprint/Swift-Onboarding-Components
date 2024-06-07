import { enIdentifyJson as identify, enIdvJson as idv } from '@onefootprint/idv';
import { enUiJson as ui } from '@onefootprint/ui';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/common.json';

const resources = {
  en: {
    common: en,
    idv,
    ui,
    identify,
  },
};
const I18NOptions = {
  resources,
  lng: 'en',
  defaultNS: 'common',
  ns: ['common', 'idv', 'ui', 'request', 'identify'],
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
};

i18next.use(initReactI18next).init(I18NOptions);

export default i18next;
