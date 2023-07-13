import { mockRequest } from '@onefootprint/test-utils';
import { GetD2PResponse } from '@onefootprint/types';

export const authTokenFixture = '123';

export const withD2PStatus = (response: GetD2PResponse) =>
  mockRequest({
    method: 'get',
    path: '/hosted/onboarding/d2p/status',
    response,
  });
