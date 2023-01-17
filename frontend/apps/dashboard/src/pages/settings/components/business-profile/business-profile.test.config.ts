import { mockRequest } from '@onefootprint/test-utils';
import { Organization } from '@onefootprint/types';

export const organizationFixture: Organization = {
  id: 'org_9L42CAdpXhDeSmi1DI8Qks',
  name: 'Footprint',
  logoUrl: 'https://onefootprint.com/logo.png',
  isSandboxRestricted: false,
  websiteUrl: 'https://onefootprint.com',
  companySize: null,
};

export const withOrganization = () =>
  mockRequest({
    method: 'get',
    path: '/org',
    response: organizationFixture,
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
