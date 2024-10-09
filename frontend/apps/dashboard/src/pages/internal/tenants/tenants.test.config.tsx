import type { PaginatedRequestResponse } from '@onefootprint/request';
import { mockRequest } from '@onefootprint/test-utils';
import type { GetTenantsResponse, Organization } from '@onefootprint/types';

export const tenantsFixture: PaginatedRequestResponse<GetTenantsResponse> = {
  data: [
    {
      id: '_private_it_org_1',
      name: 'Footprint Live Integration Testing',
      domains: [],
      allowDomainAccess: false,
      isLive: true,
      isProdKycPlaybookRestricted: false,
      isProdKybPlaybookRestricted: true,
      supportedAuthMethods: null,
      numLiveVaults: 1556,
      numSandboxVaults: 0,
      createdAt: '2023-06-07T19:13:12.074521Z',
      superTenantId: null,
    },
    {
      id: 'org_wlN7vCQ7nZabaByoWTgVpM',
      name: 'onefootprint.com',
      domains: ['onefootprint.com', 'footprint.dev'],
      allowDomainAccess: true,
      isLive: true,
      isProdKycPlaybookRestricted: false,
      isProdKybPlaybookRestricted: true,
      supportedAuthMethods: null,
      numLiveVaults: 11,
      numSandboxVaults: 103,
      createdAt: '2023-06-06T18:21:05.349780Z',
      superTenantId: null,
    },
    {
      id: '_private_it_org_2',
      name: 'Footprint Sandbox Integration Testing',
      domains: [],
      allowDomainAccess: false,
      isLive: true,
      isProdKycPlaybookRestricted: false,
      isProdKybPlaybookRestricted: true,
      supportedAuthMethods: null,
      numLiveVaults: 4,
      numSandboxVaults: 2740,
      createdAt: '2023-06-06T17:58:56.928098Z',
      superTenantId: null,
    },
  ],
  meta: {
    count: 3,
  },
};

export const orgFixture: Organization = {
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  name: 'Acme Inc',
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
  logoUrl: null,
  parent: null,
  websiteUrl: null,
};

export const withTenants = (response: PaginatedRequestResponse<GetTenantsResponse> = tenantsFixture) =>
  mockRequest({
    method: 'get',
    path: '/private/tenants',
    response,
  });

export const withTenantsError = () =>
  mockRequest({
    method: 'get',
    path: '/private/tenants',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
