import type { enUiJson as uiResource } from '@onefootprint/ui';

import type commonResourceEn from '@/config/locales/en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      common: typeof commonResourceEn;
      ui: typeof uiResource;
    };
  }
}
