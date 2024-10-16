import type { enRequestJson as requestResource } from '@onefootprint/request';
import type { enUiJson as uiResource } from '@onefootprint/ui';

import type apiKeys from '../config/locales/en/api-keys.json';
import type authentication from '../config/locales/en/authentication.json';
import type businessDetailsResource from '../config/locales/en/business-details.json';
import type businessesResource from '../config/locales/en/businesses.json';
import type commonResource from '../config/locales/en/common.json';
import type domainRestrictionsResource from '../config/locales/en/domain-restrictions.json';
import type entityDetails from '../config/locales/en/entity-details.json';
import type entityDocuments from '../config/locales/en/entity-documents.json';
import type homeResource from '../config/locales/en/home.json';
import type internalResource from '../config/locales/en/internal.json';
import type listsResource from '../config/locales/en/lists.json';
import type onboardingResource from '../config/locales/en/onboarding.json';
import type playbookDetailsResource from '../config/locales/en/playbook-details.json';
import type playbookResource from '../config/locales/en/playbooks.json';
import type proxyConfigsResource from '../config/locales/en/proxy-configs.json';
import type rolesResource from '../config/locales/en/roles.json';
import type securityLogsResource from '../config/locales/en/security-logs.json';
import type settingsResource from '../config/locales/en/settings.json';
import type switchOrgresource from '../config/locales/en/switch-org.json';
import type userDetailsResource from '../config/locales/en/user-details.json';
import type usersResource from '../config/locales/en/users.json';
import type webhooksResource from '../config/locales/en/webhooks.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    fallbackNS: 'common';
    resources: {
      'api-keys': typeof apiKeys;
      'business-details': typeof businessDetailsResource;
      'domain-restrictions': typeof domainRestrictionsResource;
      'entity-details': typeof entityDetails;
      'entity-documents': typeof entityDocuments;
      'playbook-details': typeof playbookDetailsResource;
      'proxy-configs': typeof proxyConfigsResource;
      'security-logs': typeof securityLogsResource;
      'switch-org': typeof switchOrgresource;
      'user-details': typeof userDetailsResource;
      authentication: typeof authentication;
      businesses: typeof businessesResource;
      common: typeof commonResource;
      home: typeof homeResource;
      internal: typeof internalResource;
      lists: typeof listsResource;
      onboarding: typeof onboardingResource;
      playbooks: typeof playbookResource;
      request: typeof requestResource;
      roles: typeof rolesResource;
      settings: typeof settingsResource;
      ui: typeof uiResource;
      users: typeof usersResource;
      webhooks: typeof webhooksResource;
    };
  }
}
