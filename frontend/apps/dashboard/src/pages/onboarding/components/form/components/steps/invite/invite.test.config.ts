import { mockRequest } from '@onefootprint/test-utils';
import type { Organization, Role } from '@onefootprint/types';
import { RoleKind, RoleScopeKind } from '@onefootprint/types';

export const RolesFixture: Role[] = [
  {
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: [{ kind: RoleScopeKind.admin }],
    isImmutable: true,
    createdAt: '2022-09-19T16:24:35.367322Z',
    numActiveUsers: 1,
    numActiveApiKeys: 2,
    kind: RoleKind.dashboardUser,
  },
  {
    id: 'Role_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: [{ kind: RoleScopeKind.read }],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 0,
    numActiveApiKeys: 3,
    kind: RoleKind.dashboardUser,
  },
];

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

export const withRoles = (Roles: Role[] = RolesFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    response: {
      data: Roles,
      meta: {
        next: null,
        count: null,
      },
    },
  });

export const withRolesError = () =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

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

export const withInviteMember = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    response: null,
  });

export const withInviteMemberError = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
