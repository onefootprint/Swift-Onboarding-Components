import { mockRequest } from '@onefootprint/test-utils';
import type { UserUpdateResponse } from '@onefootprint/types';

export const userFixture: UserUpdateResponse = {
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
};

export const withUpdateUser = (response: UserUpdateResponse = userFixture) =>
  mockRequest({
    method: 'patch',
    path: '/org/member',
    response,
  });

export const withUpdateUserError = () =>
  mockRequest({
    method: 'patch',
    path: '/org/member',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
