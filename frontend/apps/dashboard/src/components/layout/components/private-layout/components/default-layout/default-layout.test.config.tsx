import { mockRequest } from '@onefootprint/test-utils';
import type { GetAuthRoleResponse } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';

export const getOrgAuthRoleFixture: GetAuthRoleResponse = [
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_1',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Footprint Live Integration Testing',
    parent: null,
    websiteUrl: null,
  },
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_3',
    isAuthMethodSupported: false,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Footprint Integration Testing Foo',
    parent: null,
    websiteUrl: null,
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

export const withMembersRead = () =>
  mockRequest({
    method: 'get',
    path: '/org/member',
    statusCode: 200,
    response: {
      scopes: [RoleScopeKind.read],
      tenant: {
        isSandboxRestricted: false,
      },
    },
  });

export const withMembersAdmin = () =>
  mockRequest({
    method: 'get',
    path: '/org/member',
    statusCode: 200,
    response: {
      scopes: [RoleScopeKind.admin],
      tenant: {
        isSandboxRestricted: false,
      },
    },
  });

export const withGhostPosts = () =>
  mockRequest({
    method: 'get',
    path: '/ghost/api/v3/content/posts/',
    response: { posts: [] },
  });
