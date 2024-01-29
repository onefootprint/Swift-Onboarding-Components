import type { enUiJson as uiResource } from '@onefootprint/ui';

import type businessesResource from '../config/locales/en/businesses.json';
import type commonResource from '../config/locales/en/common.json';
import type domainRestrictionsResource from '../config/locales/en/domain-restrictions.json';
import type internalResource from '../config/locales/en/internal.json';
import type usersResource from '../config/locales/en/users.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      ui: typeof uiResource;
      common: typeof commonResource;
      businesses: typeof businessesResource;
      'domain-restrictions': typeof domainRestrictionsResource;
      internal: typeof internalResource;
      users: typeof usersResource;
    };
  }
}
