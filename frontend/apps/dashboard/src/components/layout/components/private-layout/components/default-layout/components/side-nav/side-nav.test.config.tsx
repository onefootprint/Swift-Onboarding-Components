import { mockRequest } from '@onefootprint/test-utils';
import { type GetAuthRoleResponse, type OrgAssumeRoleResponse, RoleKind, RoleScopeKind } from '@onefootprint/types';

export const getOrgAuthRoleFixture: GetAuthRoleResponse = [
  {
    id: 'org_hyZP3ksCvsT0AlLqMZsgrI',
    name: 'Acme',
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
    allowedPreviewApis: [],
  },
  {
    id: '_private_it_org_2',
    name: 'No Auth Tenant',
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
    allowedPreviewApis: [],
  },
  {
    id: '_private_it_org_3',
    name: 'Test Tenant 3',
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
    allowedPreviewApis: [],
  },
  {
    id: '_private_it_org_4',
    name: 'Test Tenant 4',
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
    allowedPreviewApis: [],
  },
  {
    id: '_private_it_org_5',
    name: 'Test Tenant 5',
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
    allowedPreviewApis: [],
  },
  {
    id: '_private_it_org_6',
    name: 'Test Tenant 6',
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
    allowedPreviewApis: [],
  },
  {
    id: '_private_it_org_7',
    name: 'Test Tenant 7',
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
    allowedPreviewApis: [],
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
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domains: [],
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    parent: null,
    allowedPreviewApis: [],
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
