import { getOffsetPaginatedDashboardSecretApiKey, getOrganizationRole } from '@onefootprint/fixtures/dashboard';
import { getCreateApiKeyRequest } from '@onefootprint/fixtures/dashboard';
import type { OrganizationRole } from '@onefootprint/request-types/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const RolesFixture: OrganizationRole[] = [
  getOrganizationRole({
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: [{ kind: 'admin' }],
    isImmutable: true,
    createdAt: '2022-09-19T16:24:35.367322Z',
    numActiveUsers: 1,
    numActiveApiKeys: 3,
    kind: 'api_key',
  }),
  getOrganizationRole({
    id: 'Role_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: [{ kind: 'read' }],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 0,
    numActiveApiKeys: 2,
    kind: 'api_key',
  }),
];

const listApiKeysFixture = getOffsetPaginatedDashboardSecretApiKey({
  data: [
    {
      id: 'key_id_peQwDyoIX4BmxqeflDvq2d',
      name: 'Acme Bank',
      status: 'enabled',
      createdAt: '2022-07-07T15:40:38.002041Z',
      key: 'sk_test_123',
      lastUsedAt: '2022-07-07T16:40:38.002041Z',
      isLive: true,
      role: RolesFixture[0],
      scrubbedKey: 'sk_****_123',
    },
  ],
}).data;

export const createdOrgApiKeyFixture = getCreateApiKeyRequest({
  name: 'Lorem Bank',
});

export const withApiKeys = (data = listApiKeysFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/api_keys',
    response: { data },
  });

export const withCreateApiKeys = (data = createdOrgApiKeyFixture) =>
  mockRequest({
    method: 'post',
    path: '/org/api_keys',
    response: data,
  });

export const withRoles = (Roles: OrganizationRole[] = RolesFixture) =>
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
