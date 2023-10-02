import { mockRequest } from '@onefootprint/test-utils';

const withD2PSms = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/onboarding/d2p/sms',
    response: {
      data: {},
    },
  });

export default withD2PSms;
