import type { enIdentifyJson as identifyResource, enIdvJson as idvResource } from '@onefootprint/idv';
import type { enRequestJson as requestResource } from '@onefootprint/request';
import type { enUiJson as uiResource } from '@onefootprint/ui';

import type commonResource from '../config/locales/en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      ui: typeof uiResource;
      idv: typeof idvResource;
      common: typeof commonResource;
      request: typeof requestResource;
      identify: typeof identifyResource;
    };
  }
}
