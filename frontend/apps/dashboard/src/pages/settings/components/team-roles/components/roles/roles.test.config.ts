import { mockRequest } from '@onefootprint/test-utils';
import { Role, RoleScopeKind } from '@onefootprint/types';

export const RolesFixture: Role[] = [
  {
    id: 'Role_aExxJ5gSBpvqIJ2VcHH6J',
    name: 'Customer support',
    scopes: [{ kind: RoleScopeKind.apiKeys }],
    isImmutable: false,
    createdAt: '2022-11-18T00:04:11.368107Z',
    numActiveUsers: 0,
    numActiveApiKeys: 0,
  },
  {
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Super',
    scopes: [{ kind: RoleScopeKind.admin }],
    isImmutable: true,
    createdAt: '2023-01-25T21:47:22.679708Z',
    numActiveUsers: 2,
    numActiveApiKeys: 3,
  },
  {
    id: 'Role_erflKNWEF13143EWRWELJN',
    name: 'Read only',
    isImmutable: true,
    scopes: [{ kind: RoleScopeKind.read }],
    createdAt: '2023-01-06T04:33:34.272399Z',
    numActiveUsers: 4,
    numActiveApiKeys: 5,
  },
];

export const RolesCreatedAtFixture = [
  '11/18/22, 12:04 AM',
  '1/25/23, 9:47 PM',
  '1/6/23, 4:33 AM',
];

export const RolesScopesFixture = ['Everything', 'Read', 'Manage Api Keys'];

export const RoleWithoutActiveUsers = RolesFixture[0];

export const RoleToEdit = RolesFixture[0];

export const withRoles = (roles: Role[] = RolesFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    response: {
      data: roles,
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
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withCreateRole = (role: Role = RolesFixture[0]) =>
  mockRequest({
    method: 'post',
    path: '/org/roles',
    response: role,
  });

export const withCreateRoleError = () =>
  mockRequest({
    method: 'post',
    path: '/org/roles',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withUpdateRole = (role: Role) =>
  mockRequest({
    method: 'patch',
    path: `/org/roles/${role.id}`,
    response: role,
  });

export const withUpdateRoleError = (role: Role) =>
  mockRequest({
    method: 'patch',
    path: `/org/roles/${role.id}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withDisableRole = (id: string) =>
  mockRequest({
    method: 'post',
    path: `/org/roles/${id}/deactivate`,
    response: null,
  });

export const withDisableRoleError = (id: string) =>
  mockRequest({
    method: 'post',
    path: `/org/roles/${id}/deactivate`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export default withRoles;
