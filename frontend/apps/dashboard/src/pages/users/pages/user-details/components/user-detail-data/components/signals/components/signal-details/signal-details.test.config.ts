import { mockRequest } from '@onefootprint/test-utils';

export const riskSignalDetailsFixture = {
  id: 'sig_ryxauTlDX8hIm3wVRmm',
  onboarding_decision_id: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
  reason_code: 'mobile_number',
  note: "The consumer's phone number is possibly a wireless mobile number.",
  severity: 'Info',
  scopes: ['phone_number'],
  timestamp: '2022-10-24T21:56:12.682238Z',
  deactivated_at: null,
  vendors: ['idology'],
};

export const withRiskSignalDetails = () =>
  mockRequest({
    method: 'get',
    path: '/users/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals/sig_ryxauTlDX8hIm3wVRmm',
    response: riskSignalDetailsFixture,
  });

export const withRiskSignalDetailsError = () =>
  mockRequest({
    method: 'get',
    path: '/users/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals/sig_ryxauTlDX8hIm3wVRmm',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
