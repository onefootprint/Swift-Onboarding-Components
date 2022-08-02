import { mockRequest } from 'test-utils';

export const apiKeysFixture = [
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

export const withApiKeys = () =>
  mockRequest({
    method: 'get',
    path: '/org/api_keys',
    response: {
      data: apiKeysFixture,
    },
  });

export const withApiKeysError = () =>
  mockRequest({
    method: 'get',
    path: '/org/api_keys',
    statusCode: 403,
    response: {
      error: {
        message: 'Something bad happened',
      },
    },
  });
