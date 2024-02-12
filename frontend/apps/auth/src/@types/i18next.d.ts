import type { enIdvJson as idvResource } from '@onefootprint/idv';
import type { enRequestJson as requestResource } from '@onefootprint/request';
import type { enUiJson as uiResource } from '@onefootprint/ui';

import type commonResource from '../config/locales/en/common.json';
import type identifyResource from '../config/locales/en/identify.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      ui: typeof uiResource;
      idv: typeof idvResource;
      common: typeof commonResource;
      identify: typeof identifyResource;
      request: typeof requestResource;
    };
  }
}
