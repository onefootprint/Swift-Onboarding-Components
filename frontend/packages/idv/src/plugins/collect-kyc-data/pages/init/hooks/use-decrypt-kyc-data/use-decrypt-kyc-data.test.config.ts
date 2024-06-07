import { mockRequest } from '@onefootprint/test-utils';
import type { DataIdentifier, UserTokenScope } from '@onefootprint/types';

export const withDecrypt = (data: Partial<Record<DataIdentifier, string | undefined>>) =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/decrypt',
    response: data,
  });

export const withDecryptError = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/decrypt',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withUserToken = (scopes: UserTokenScope[]) =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/token',
    response: {
      scopes,
    },
  });

export const withUserTokenError = () =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/token',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
