import type { enRequestJson as requestResource } from '@onefootprint/request';
import type { enUiJson as uiResource } from '@onefootprint/ui';

import type authentication from '../config/locales/en/authentication.json';
import type businessesResource from '../config/locales/en/businesses.json';
import type commonResource from '../config/locales/en/common.json';
import type domainRestrictionsResource from '../config/locales/en/domain-restrictions.json';
import type internalResource from '../config/locales/en/internal.json';
import type listsResource from '../config/locales/en/lists.json';
import type userDetails from '../config/locales/en/user-details-documents.json';
import type usersResource from '../config/locales/en/users.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      authentication: typeof authentication;
      ui: typeof uiResource;
      common: typeof commonResource;
      businesses: typeof businessesResource;
      'domain-restrictions': typeof domainRestrictionsResource;
      internal: typeof internalResource;
      users: typeof usersResource;
      lists: typeof listsResource;
      request: typeof requestResource;
      'user-details': typeof userDetails;
    };
  }
}
