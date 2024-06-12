import { mockRequest } from '@onefootprint/test-utils';
import type { ProxyConfig, Role } from '@onefootprint/types';
import { RoleKind, RoleScopeKind } from '@onefootprint/types';

export const rolesFixture: Role[] = [
  {
    createdAt: '2022-11-18T00:04:11.368107Z',
    id: 'orgrole_VFgjE8N8C4iG3GqlkBFoj',
    isImmutable: false,
    kind: RoleKind.dashboardUser,
    name: 'Admin',
    numActiveApiKeys: 0,
    numActiveUsers: 0,
    scopes: [{ kind: RoleScopeKind.admin }],
  },
  {
    createdAt: '2023-01-06T04:33:34.272399Z',
    id: 'orgrole_tzXNHNYXyPWvyxRXlDjaFB',
    isImmutable: true,
    kind: RoleKind.dashboardUser,
    name: 'Member',
    numActiveApiKeys: 10,
    numActiveUsers: 10,
    scopes: [{ kind: RoleScopeKind.read }],
  },
];

export const rolesCreatedAtFixture = ['11/18/22, 12:04 AM', '1/6/23, 4:33 AM'];

export const rolesScopesFixture = [['Everything'], ['Read-only']];

export const roleWithoutActiveUsers = rolesFixture[0];

export const roleToEdit = rolesFixture[0];

export const withProxyConfigs = (proxyConfigs: ProxyConfig[] = []) =>
  mockRequest({
    method: 'get',
    path: '/org/proxy_configs',
    response: proxyConfigs,
  });

export const withRoles = (roles: Role[] = rolesFixture) =>
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
      message: 'Something went wrong',
    },
  });

export const withCreateRole = (role: Role = rolesFixture[0]) =>
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
      message: 'Something went wrong',
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
      message: 'Something went wrong',
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
      message: 'Something went wrong',
    },
  });

export default withRoles;
