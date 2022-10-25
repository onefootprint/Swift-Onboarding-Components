import { mockRequest } from '@onefootprint/test-utils';

export const signalsFixture = [
  {
    id: 'sig_ryxauTlDX8hIm3wVRmm',
    onboarding_decision_id: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    reason_code: 'mobile_number',
    note: "The consumer's phone number is possibly a wireless mobile number.",
    severity: 'Info',
    scopes: ['phone_number'],
    timestamp: '2022-10-24T21:56:12.682238Z',
    deactivated_at: null,
    vendors: ['idology'],
  },
  {
    id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
    onboarding_decision_id: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    reason_code: 'corporate_email_domain',
    note: 'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
    severity: 'Info',
    scopes: ['email'],
    timestamp: '2022-10-24T21:56:12.682238Z',
    deactivated_at: null,
    vendors: ['idology'],
  },
];

export const withSignals = () =>
  mockRequest({
    method: 'get',
    path: '/users/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals',
    response: signalsFixture,
  });

export const withSignalsError = () =>
  mockRequest({
    method: 'get',
    path: '/users/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
