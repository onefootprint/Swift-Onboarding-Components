import { mockRequest } from '@onefootprint/test-utils';
import {
  RiskSignal,
  RiskSignalSeverity,
  SignalAttribute,
} from '@onefootprint/types';

export const riskSignalDetailsFixture: RiskSignal = {
  id: 'sig_ryxauTlDX8hIm3wVRmm',
  onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
  reasonCode: 'mobile_number',
  description:
    "The consumer's phone number is possibly a wireless mobile number.",
  severity: RiskSignalSeverity.Low,
  scopes: [SignalAttribute.phoneNumber],
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
