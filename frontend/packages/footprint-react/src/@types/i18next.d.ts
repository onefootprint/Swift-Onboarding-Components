import 'i18next';

import type enCommon from '../config/locales/en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      common: typeof enCommon;
    };
  }
}
