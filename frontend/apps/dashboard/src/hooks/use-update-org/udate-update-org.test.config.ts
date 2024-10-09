import { mockRequest } from '@onefootprint/test-utils';
import type { Organization } from '@onefootprint/types';

export const organizationFixture: Organization = {
  id: 'org_9L42CAdpXhDeSmi1DI8Qks',
  name: 'Acme',
  allowDomainAccess: false,
  allowedPreviewApis: [],
  companySize: null,
  domains: [],
  isDomainAlreadyClaimed: false,
  isProdAuthPlaybookRestricted: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  isProdNeuroEnabled: false,
  isProdSentilinkEnabled: false,
  isSandboxRestricted: false,
  logoUrl: 'https://acme.com/logo.png',
  parent: null,
  websiteUrl: 'https://acme.com',
};

export const withUpdateOrg = (newOrg: Partial<Organization>) =>
  mockRequest({
    method: 'patch',
    path: '/org',
    response: {
      ...organizationFixture,
      ...newOrg,
    },
  });
