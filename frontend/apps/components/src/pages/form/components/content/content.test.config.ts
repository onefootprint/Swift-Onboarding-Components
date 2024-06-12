import { mockRequest } from '@onefootprint/test-utils';

export const withSdkArgs = (props?: Record<string, unknown>) =>
  mockRequest({
    method: 'get',
    path: '/org/sdk_args',
    response: {
      args: {
        kind: 'form_v1',
        data: props || {
          authToken: 'tok_123',
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

export const withClientTokenFieldsExpiredAuthToken = () =>
  mockRequest({
    method: 'get',
    path: '/entities/client_token',
    response: {
      vault_fields: [],
      expires_at: new Date('01/01/2020'),
    },
  });

export const withClientTokenFields = () =>
  mockRequest({
    method: 'get',
    path: '/entities/client_token',
    response: {
      vault_fields: ['card.primary.number', 'card.primary.cvc', 'card.primary.expiration'],
      expires_at: new Date(),
    },
  });

export const withClientTokenFieldsError = () =>
  mockRequest({
    method: 'get',
    path: '/entities/client_token',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withClientTokenFieldsMissingPermissions = () =>
  mockRequest({
    method: 'get',
    path: '/entities/client_token',
    response: {
      data: {
        vault_fields: [],
        expires_at: new Date('01/01/2200'),
      },
    },
  });
