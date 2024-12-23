import { mockRequest } from '@onefootprint/test-utils';
import { type GetAuthRoleResponse, type OrgAssumeRoleResponse, RoleKind, RoleScopeKind } from '@onefootprint/types';

export const getOrgAuthRoleFixture: GetAuthRoleResponse = [
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: 'org_hyZP3ksCvsT0AlLqMZsgrI',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Acme',
    parent: null,
    websiteUrl: null,
  },
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_2',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'No Auth Tenant',
    parent: null,
    websiteUrl: null,
  },
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_3',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Test Tenant 3',
    parent: null,
    websiteUrl: null,
  },
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_4',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Test Tenant 4',
    parent: null,
    websiteUrl: null,
  },
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_5',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Test Tenant 5',
    parent: null,
    websiteUrl: null,
  },
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_6',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Test Tenant 6',
    parent: null,
    websiteUrl: null,
  },
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_7',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Test Tenant 7',
    parent: null,
    websiteUrl: null,
  },
];

export const withGhostPosts = () =>
  mockRequest({
    method: 'get',
    path: '/ghost/api/v3/content/posts/',
    response: { posts: [] },
  });

export const withRiskSignals = () =>
  mockRequest({
    method: 'get',
    path: '/org/risk_signals',
    response: { data: [], meta: { count: 0 } },
  });

export const withEntities = () =>
  mockRequest({
    method: 'post',
    path: '/entities/search',
    response: { data: [], meta: { count: 0 } },
  });

export const withTwoOrgAuthRoles = () =>
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    response: getOrgAuthRoleFixture.slice(0, 2),
  });

export const withSevenOrgAuthRoles = () =>
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    response: getOrgAuthRoleFixture,
  });

export const withOrgAuthRolesError = () =>
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    statusCode: 400,
    response: {
      error: { message: 'Something went wrong' },
    },
  });

export const orgAssumeRoleFixture: OrgAssumeRoleResponse = {
  token: 'dbtok_new',
  user: {
    id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
    email: 'jane@onefootprint.com',
    firstName: null,
    lastName: null,
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Admin',
      numActiveUsers: 1,
      numActiveApiKeys: 0,
      scopes: [{ kind: RoleScopeKind.admin }],
      kind: RoleKind.dashboardUser,
    },
    rolebinding: {
      lastLoginAt: '2023-01-18T17:54:10.668420Z',
    },
  },
  tenant: {
    id: '_private_it_org_3',
    name: 'Test Tenant 3',
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    parent: null,
    websiteUrl: null,
  },
};

export const withOrgAssumeRole = () =>
  mockRequest({
    method: 'post',
    path: '/org/auth/assume_role',
    response: orgAssumeRoleFixture,
  });

export const withOrgAssumeRoleError = () =>
  mockRequest({
    method: 'post',
    path: '/org/auth/assume_role',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withFootprintWrapped = () =>
  mockRequest({
    method: 'get',
    path: '/org/footprint_wrapped',
    response: {},
  });
