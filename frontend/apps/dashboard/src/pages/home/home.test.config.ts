import { mockRequest } from '@onefootprint/test-utils';
import type { OrgMetrics } from '@onefootprint/types/src/data';

export const orgMetricsFixture = {
  newUserVaults: 8910,
  totalUserOnboardings: 1058814,
  successfulUserOnboardings: 1036817,
  failedUserOnboardings: 17187,
  incompleteUserOnboardings: 4810,
};

export const emptyOrgMetricsFixture = {
  newUserVaults: 0,
  totalUserOnboardings: 0,
  successfulUserOnboardings: 0,
  failedUserOnboardings: 0,
  incompleteUserOnboardings: 0,
};

export const withOrgMetrics = (response: OrgMetrics = orgMetricsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/metrics',
    response,
  });

export const withOrgMetricsError = () =>
  mockRequest({
    method: 'get',
    path: '/org/metrics',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
