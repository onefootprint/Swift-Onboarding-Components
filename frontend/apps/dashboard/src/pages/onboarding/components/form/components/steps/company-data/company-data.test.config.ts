import { mockRequest } from '@onefootprint/test-utils';
import type { Organization } from '@onefootprint/types';

export const orgFixture: Organization = {
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  name: 'Acme Inc',
  allowDomainAccess: false,
  allowedPreviewApis: [],
  companySize: null,
  domains: [],
  isDomainAlreadyClaimed: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  isProdAuthPlaybookRestricted: false,
  isProdNeuroEnabled: false,
  isProdSentilinkEnabled: false,
  isSandboxRestricted: false,
  logoUrl: null,
  parent: null,
  websiteUrl: null,
};

export const withOrg = (response: Organization = orgFixture) =>
  mockRequest({
    method: 'get',
    path: '/org',
    response,
  });

export const withOrgError = () =>
  mockRequest({
    method: 'get',
    path: '/org',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withUpdateOrg = (response: Partial<Organization>) =>
  mockRequest({
    method: 'patch',
    path: '/org',
    response,
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
