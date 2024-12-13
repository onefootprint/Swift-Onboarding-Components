import type { enRequestJson as requestResource } from '@onefootprint/request';
import type { enUiJson as uiResource } from '@onefootprint/ui';

import type identifyResource from '../config/locales/en/identify.json';
import type idvResource from '../config/locales/en/idv.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'idv';
    resources: {
      identify: typeof identifyResource;
      idv: typeof idvResource;
      request: typeof requestResource;
      ui: typeof uiResource;
    };
  }
}
