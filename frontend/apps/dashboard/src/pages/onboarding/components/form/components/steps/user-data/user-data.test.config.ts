import { mockRequest } from '@onefootprint/test-utils';
import { UserUpdateResponse } from '@onefootprint/types';

export const userFixture: UserUpdateResponse = {
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
};

export const withUser = () =>
  mockRequest({
    method: 'put',
    fullPath: true,
    path: 'https://6398b28afe03352a94dba0aa.mockapi.io/api/users/1',
    response: {
      data: userFixture,
    },
  });

export const withUserError = () =>
  mockRequest({
    method: 'put',
    fullPath: true,
    path: 'https://6398b28afe03352a94dba0aa.mockapi.io/api/users/1',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
