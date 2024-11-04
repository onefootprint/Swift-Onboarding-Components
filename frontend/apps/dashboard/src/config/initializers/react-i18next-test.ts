import { enUiJson as ui } from '@onefootprint/ui';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import apiKeys from '../locales/en/api-keys.json';
import authentication from '../locales/en/authentication.json';
import businessDetails from '../locales/en/business-details.json';
import businesses from '../locales/en/businesses.json';
import common from '../locales/en/common.json';
import domainRestrictions from '../locales/en/domain-restrictions.json';
import entityDetails from '../locales/en/entity-details.json';
import entityDocuments from '../locales/en/entity-documents.json';
import home from '../locales/en/home.json';
import internal from '../locales/en/internal.json';
import onboarding from '../locales/en/onboarding.json';
import playbookDetails from '../locales/en/playbook-details.json';
import playbooks from '../locales/en/playbooks.json';
import proxyConfigs from '../locales/en/proxy-configs.json';
import roles from '../locales/en/roles.json';
import securityLogs from '../locales/en/security-logs.json';
import settings from '../locales/en/settings.json';
import switchOrg from '../locales/en/switch-org.json';
import userDetails from '../locales/en/user-details.json';
import users from '../locales/en/users.json';
import webhooks from '../locales/en/webhooks.json';

i18next.use(initReactI18next).init({
  resources: {
    en: {
      'api-keys': apiKeys,
      'business-details': businessDetails,
      'domain-restrictions': domainRestrictions,
      'entity-details': entityDetails,
      'entity-documents': entityDocuments,
      'playbook-details': playbookDetails,
      'proxy-configs': proxyConfigs,
      'security-logs': securityLogs,
      'switch-org': switchOrg,
      'user-details': userDetails,
      authentication,
      businesses,
      common,
      home,
      internal,
      onboarding,
      playbooks,
      roles,
      settings,
      ui,
      users,
      webhooks: webhooks,
    },
  },
  lng: 'en',
  defaultNS: 'common',
  ns: [
    'api-keys',
    'authetication',
    'business-details',
    'businesses',
    'common',
    'domain-restrictions',
    'entity-details',
    'entity-documents',
    'home',
    'internal',
    'lists',
    'onboarding',
    'playbook-details',
    'playbooks',
    'proxy-configs',
    'roles',
    'security-logs',
    'settings',
    'switch-org',
    'ui',
    'user-details',
    'users',
    'webhooks',
  ],
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
});
