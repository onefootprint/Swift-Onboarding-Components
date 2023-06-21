import { mockRequest } from '@onefootprint/test-utils';
import {
  Organization,
  Role,
  RoleScope,
  UserUpdateResponse,
} from '@onefootprint/types';

export const userFixture: UserUpdateResponse = {
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
};

export const orgFixture: Organization = {
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  name: 'Acme Inc',
  logoUrl: null,
  isSandboxRestricted: false,
  websiteUrl: null,
  companySize: null,
};

export const RolesFixture: Role[] = [
  {
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: [RoleScope.admin],
    isImmutable: true,
    createdAt: '2022-09-19T16:24:35.367322Z',
    numActiveUsers: 1,
    numActiveApiKeys: 2,
  },
  {
    id: 'Role_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: [RoleScope.read],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 0,
    numActiveApiKeys: 3,
  },
];

export const withUpdateUser = (response: UserUpdateResponse = userFixture) =>
  mockRequest({
    method: 'patch',
    path: '/org/member',
    response,
  });

export const withOrg = (response: Organization = orgFixture) =>
  mockRequest({
    method: 'get',
    path: '/org',
    response,
  });

export const withUpdateOrg = (response: Partial<Organization> = orgFixture) =>
  mockRequest({
    method: 'patch',
    path: '/org',
    response,
  });

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

export const withInviteMember = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    response: null,
  });
