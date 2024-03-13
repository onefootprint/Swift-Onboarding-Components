import type { enUiJson as uiResource } from '@onefootprint/ui';

import type commonResourceEn from '@/config/locales/en/common.json';
import type commonResourceEs from '@/config/locales/es/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      common: typeof commonResourceEn & typeof commonResourceEs;
      ui: typeof uiResource;
    };
  }
}
