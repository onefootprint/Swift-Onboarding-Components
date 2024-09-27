import type { enRequestJson as requestResource } from '@onefootprint/request';
import type { enUiJson as uiResource } from '@onefootprint/ui';

import type apiKeys from '../config/locales/en/api-keys.json';
import type authentication from '../config/locales/en/authentication.json';
import type businessesResource from '../config/locales/en/businesses.json';
import type commonResource from '../config/locales/en/common.json';
import type domainRestrictionsResource from '../config/locales/en/domain-restrictions.json';
import type entityDetails from '../config/locales/en/entity-details.json';
import type entityDocuments from '../config/locales/en/entity-documents.json';
import type homeResource from '../config/locales/en/home.json';
import type internalResource from '../config/locales/en/internal.json';
import type listsResource from '../config/locales/en/lists.json';
import type onboardingResource from '../config/locales/en/onboarding.json';
import type playbookResource from '../config/locales/en/playbooks.json';
import type proxyConfigsResource from '../config/locales/en/proxy-configs.json';
import type rolesResource from '../config/locales/en/roles.json';
import type securityLogsResource from '../config/locales/en/security-logs.json';
import type settingsResource from '../config/locales/en/settings.json';
import type switchOrgresource from '../config/locales/en/switch-org.json';
import type usersResource from '../config/locales/en/users.json';
import type webhooksResource from '../config/locales/en/webhooks.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      'domain-restrictions': typeof domainRestrictionsResource;
      'entity-details': typeof entityDetails;
      'entity-documents': typeof entityDocuments;
      'switch-org': typeof switchOrgresource;
      'api-keys': typeof apiKeys;
      authentication: typeof authentication;
      businesses: typeof businessesResource;
      common: typeof commonResource;
      internal: typeof internalResource;
      lists: typeof listsResource;
      playbooks: typeof playbookResource;
      request: typeof requestResource;
      ui: typeof uiResource;
      users: typeof usersResource;
      home: typeof homeResource;
      settings: typeof settingsResource;
      'proxy-configs': typeof proxyConfigsResource;
      onboarding: typeof onboardingResource;
      'security-logs': typeof securityLogsResource;
      roles: typeof rolesResource;
      webhooks: typeof webhooksResource;
    };
  }
}
