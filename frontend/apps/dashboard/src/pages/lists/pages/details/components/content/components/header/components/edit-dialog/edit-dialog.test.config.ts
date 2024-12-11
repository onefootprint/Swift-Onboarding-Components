import { getListDetails } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const listDetailsFixture = getListDetails({});

export const withListUpdateError = (listId: string) =>
  mockRequest({
    method: 'patch',
    path: `/org/lists/${listId}`,
    statusCode: 400,
    response: {
      code: 'BAD_REQUEST',
      message: 'Something went wrong',
      details: {
        message: 'Something went wrong',
      },
    },
  });

export const withListUpdate = (listId: string) =>
  mockRequest({
    method: 'patch',
    path: `/org/lists/${listId}`,
    response: {},
  });

export const withListDetails = (listId: string, data = listDetailsFixture) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: data,
  });
