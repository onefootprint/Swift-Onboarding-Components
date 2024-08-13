import { mockRequest } from '@onefootprint/test-utils';
import type { ApiKey, Role } from '@onefootprint/types';
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
    numActiveUsers: 4,
    numActiveApiKeys: 3,
    kind: RoleKind.apiKey,
  },
];

export const ApiKeyFixture: ApiKey = {
  id: 'key_lorem',
  name: 'Lorem Bank',
  status: 'enabled',
  scrubbedKey: 'sk_test_********_aL1',
  key: null,
  lastUsedAt: '2022-10-07T16:40:38.002041Z',
  createdAt: '2022-10-07T15:40:38.002041Z',
  isLive: true,
  role: RolesFixture[0],
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

export const withApiKeys = (data = ApiKeyFixture) =>
  mockRequest({
    method: 'patch',
    path: `/org/api_keys/${data.id}`,
    response: {
      data,
    },
  });
