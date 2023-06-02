import { mockRequest } from '@onefootprint/test-utils';

export const withTrigger = (entityId: string) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/trigger`,
    statusCode: 200,
    response: {},
  });

export const withTriggerError = (entityId: string) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/trigger`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
