import { mockRequest } from '@onefootprint/test-utils';

export const withSdkArgs = (props?: Record<string, unknown>) =>
  mockRequest({
    method: 'get',
    path: '/org/sdk_args',
    response: {
      args: {
        kind: 'render_v1',
        data: props || {
          authToken: 'tok_123',
          id: 'id.email',
        },
      },
    },
  });

export const withSdkArgsError = () =>
  mockRequest({
    method: 'get',
    path: '/org/sdk_args',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withDecrypt = () =>
  mockRequest({
    method: 'post',
    path: '/entities/vault/decrypt',
    response: {
      data: {
        'id.email': 'piip@onefootprint.com',
      },
    },
  });

export const withDecryptError = () =>
  mockRequest({
    method: 'post',
    path: '/entities/vault/decrypt',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
