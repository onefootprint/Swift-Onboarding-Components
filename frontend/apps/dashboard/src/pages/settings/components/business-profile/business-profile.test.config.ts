import { mockRequest } from '@onefootprint/test-utils';
import { Organization } from '@onefootprint/types';

export const organizationFixture: Organization = {
  id: 'org_9L42CAdpXhDeSmi1DI8Qks',
  name: 'Acme',
  logoUrl: 'https://acme.com/logo.png',
  isSandboxRestricted: false,
  websiteUrl: 'https://acme.com',
  companySize: null,
  domain: null,
  allowDomainAccess: false,
  isDomainAlreadyClaimed: false,
};

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
      error: {
        message: 'Something went wrong',
      },
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
      error: {
        message: 'Something went wrong',
      },
    },
  });
