import { mockRequest } from '@onefootprint/test-utils';
import { ScopedBusiness } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

beforeEach(() => {
  asAdminUser();
});

afterAll(() => {
  resetUser();
});

export const businessesListFixture: ScopedBusiness[] = [
  {
    name: 'Kreiger Group',
    id: 'fp_id_XPutoYibmM2dEggjbSRNZR',
    startTimestamp: '2023-01-13T18:31:34.305147Z',
    orderingId: 8796,
  },
  {
    name: 'Koch Inc',
    id: 'fp_id_CPutoYibmM2dEggjbSRNZR',
    startTimestamp: '2023-02-13T18:16:24.576119Z',
    orderingId: 8791,
  },
];

export const businessListFormattedFixture = [
  {
    status: 'Incomplete',
    startTimestamp: '1/13/23, 6:31 PM',
  },
  {
    status: 'Incomplete',
    startTimestamp: '2/13/23, 6:16 PM',
  },
];

// TODO: use correct endpoint
// https://linear.app/footprint/issue/FP-3090/business-list-use-correct-endpoint
export const withBusinesses = (
  businesses: ScopedBusiness[] = businessesListFixture,
) =>
  mockRequest({
    method: 'get',
    path: '/users',
    response: {
      data: businesses,
      meta: {},
    },
  });

// TODO: use correct endpoint
// https://linear.app/footprint/issue/FP-3090/business-list-use-correct-endpoint
export const withBusinessesError = () =>
  mockRequest({
    method: 'get',
    path: '/users',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
