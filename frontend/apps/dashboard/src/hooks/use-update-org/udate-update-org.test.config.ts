import { mockRequest } from '@onefootprint/test-utils';
import type { Organization } from '@onefootprint/types';

export const organizationFixture: Organization = {
  id: 'org_9L42CAdpXhDeSmi1DI8Qks',
  name: 'Acme',
  logoUrl: 'https://acme.com/logo.png',
  isSandboxRestricted: false,
  websiteUrl: 'https://acme.com',
  companySize: null,
  domains: [],
  allowDomainAccess: false,
  isDomainAlreadyClaimed: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  parent: null,
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
