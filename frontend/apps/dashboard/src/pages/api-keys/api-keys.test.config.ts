import { mockRequest } from '@onefootprint/test-utils';
import type { Role } from '@onefootprint/types';
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
    kind: RoleKind.apiKey,
  },
  {
    id: 'Role_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: [{ kind: RoleScopeKind.read }],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 0,
    numActiveApiKeys: 3,
    kind: RoleKind.apiKey,
  },
];

export const listApiKeysFixture = [
  {
    id: 'key_id_peQwDyoIX4BmxqeflDvq2d',
    name: 'Acme Bank',
    status: 'enabled',
    created_at: '2022-07-07T15:40:38.002041Z',
    key: null,
    last_used_at: '2022-07-07T16:40:38.002041Z',
    is_live: true,
    role: RolesFixture[0],
  },
];

export const createdApiKeyFixture = {
  id: 'key_lorem',
  name: 'Lorem Bank',
  status: 'enabled',
  created_at: '2022-10-07T15:40:38.002041Z',
  key: null,
  last_used_at: '2022-10-07T16:40:38.002041Z',
  is_live: true,
  role: RolesFixture[0],
};

export const withApiKeys = (data = listApiKeysFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/api_keys',
    response: { data },
  });

export const withApiKeysError = () =>
  mockRequest({
    method: 'get',
    path: '/org/api_keys',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withCreateApiKeys = (data = createdApiKeyFixture) =>
  mockRequest({
    method: 'post',
    path: '/org/api_keys',
    response: data,
  });

export const withCreateApiKeysError = () =>
  mockRequest({
    method: 'post',
    path: '/org/api_keys',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withApiReveal = (apiKey: Record<string, unknown>, key: string) =>
  mockRequest({
    method: 'post',
    path: `/org/api_keys/${apiKey.id}/reveal`,
    response: {
      ...apiKey,
      key,
    },
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
