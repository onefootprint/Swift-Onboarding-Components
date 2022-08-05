import { mockRequest } from 'test-utils';

export const listApiKeysFixture = [
  {
    id: 'key_id_peQwDyoIX4BmxqeflDvq2d',
    name: 'Acme Bank',
    status: 'enabled',
    created_at: '2022-07-07T15:40:38.002041Z',
    key: null,
    last_used_at: '2022-07-07T16:40:38.002041Z',
    is_live: true,
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
};

export const withApiKeys = (data = listApiKeysFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/api_keys',
    response: {
      data,
    },
  });

export const withApiKeysError = () =>
  mockRequest({
    method: 'get',
    path: '/org/api_keys',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withCreateApiKeys = (data = createdApiKeyFixture) =>
  mockRequest({
    method: 'post',
    path: '/org/api_keys',
    response: {
      data,
    },
  });

export const withCreateApiKeysError = () =>
  mockRequest({
    method: 'post',
    path: '/org/api_keys',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withApiReveal = (apiKey: any, key: string) =>
  mockRequest({
    method: 'get',
    path: `/org/api_keys/${apiKey.id}/reveal`,
    response: {
      ...apiKey,
      key,
    },
  });
