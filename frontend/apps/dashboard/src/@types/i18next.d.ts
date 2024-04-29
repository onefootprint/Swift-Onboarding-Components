import type { enRequestJson as requestResource } from '@onefootprint/request';
import type { enUiJson as uiResource } from '@onefootprint/ui';

import type authentication from '../config/locales/en/authentication.json';
import type businessesResource from '../config/locales/en/businesses.json';
import type commonResource from '../config/locales/en/common.json';
import type domainRestrictionsResource from '../config/locales/en/domain-restrictions.json';
import type entityDetails from '../config/locales/en/entity-details.json';
import type entityDocuments from '../config/locales/en/entity-documents.json';
import type internalResource from '../config/locales/en/internal.json';
import type listsResource from '../config/locales/en/lists.json';
import type usersResource from '../config/locales/en/users.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      'domain-restrictions': typeof domainRestrictionsResource;
      'entity-details': typeof entityDetails;
      'entity-documents': typeof entityDocuments;
      authentication: typeof authentication;
      businesses: typeof businessesResource;
      common: typeof commonResource;
      internal: typeof internalResource;
      lists: typeof listsResource;
      request: typeof requestResource;
      ui: typeof uiResource;
      users: typeof usersResource;
    };
  }
}
