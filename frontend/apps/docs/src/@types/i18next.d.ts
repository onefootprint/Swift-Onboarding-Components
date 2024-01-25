import type { enUiJson as uiResource } from '@onefootprint/ui';

import type commonResource from '../config/locales/en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    common: 'common';
    ui: 'ui';
    resources: {
      ui: typeof uiResource;
      common: typeof commonResource;
    };
  }
}
