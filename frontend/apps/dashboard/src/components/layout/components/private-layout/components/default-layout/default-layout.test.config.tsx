import { mockRequest } from '@onefootprint/test-utils';
import type { GetAuthRoleResponse } from '@onefootprint/types';

export const getOrgAuthRoleFixture: GetAuthRoleResponse = [
  {
    id: '_private_it_org_1',
    name: 'Footprint Live Integration Testing',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domains: [],
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isAuthMethodSupported: true,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    parent: null,
  },
  {
    id: '_private_it_org_3',
    name: 'Footprint Integration Testing Foo',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domains: [],
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isAuthMethodSupported: false,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    parent: null,
  },
];

export const withOrgAuthRoles = () =>
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    response: getOrgAuthRoleFixture,
  });

export const withEntities = () =>
  mockRequest({
    method: 'post',
    path: '/entities/search',
    response: { data: [] },
  });

export const withRiskSignals = () =>
  mockRequest({
    method: 'get',
    path: '/org/risk_signals',
    response: { data: [], meta: { count: 0 } },
  });
