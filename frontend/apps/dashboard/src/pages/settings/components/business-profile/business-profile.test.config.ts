import { mockRequest } from '@onefootprint/test-utils';
import type { Organization } from '@onefootprint/types';

export const organizationFixture: Organization = {
  id: 'org_9L42CAdpXhDeSmi1DI8Qks',
  name: 'Acme',
  logoUrl: 'https://acme.com/logo.png',
  websiteUrl: 'https://acme.com',
  supportEmail: 'support@acme.com',
  supportPhone: '123-456-7890',
  supportWebsite: 'https://support.acme.com',
  isSandboxRestricted: false,
  companySize: null,
  domains: [],
  allowDomainAccess: false,
  isDomainAlreadyClaimed: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  parent: null,
};

export const organizationDataLabels = [
  'Company name',
  'Website',
  'Organization ID',
  'Support email',
  'Support phone',
  'Support website',
];

export const withOrganization = (organization?: Partial<Organization>) =>
  mockRequest({
    method: 'get',
    path: '/org',
    response: {
      ...organizationFixture,
      ...organization,
    },
  });

export const withOrganizationError = () =>
  mockRequest({
    method: 'get',
    path: '/org',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withUpdateOrg = (newOrg: Partial<Organization>) =>
  mockRequest({
    method: 'patch',
    path: '/org',
    response: {
      ...organizationFixture,
      ...newOrg,
    },
  });

export const withUpdateOrgError = () =>
  mockRequest({
    method: 'patch',
    path: '/org',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
