import type { enUiJson as uiResource } from '@onefootprint/ui';

import type idvResource from '../config/locales/en/idv.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'idv';
    fallbackNS: 'idv';
    ui: 'ui';
    resources: {
      idv: typeof idvResource;
      ui: typeof uiResource;
    };
  }
}
