import { mockRequest } from '@onefootprint/test-utils';
import type { RiskSignal } from '@onefootprint/types';
import { RiskSignalAttribute, RiskSignalSeverity } from '@onefootprint/types';

export const entityIdFixture = 'fp_id_yCZehsWNeywHnk5JqL20u';

export const riskSignalDetailsFixture: RiskSignal = {
  id: 'sig_ryxauTlDX8hIm3wVRmm',
  onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
  reasonCode: 'phone_number_located_is_voip',
  note: 'VOIP phone number',
  description:
    "The consumer's phone number could be tied to an answering service, page, or VoIP.",
  severity: RiskSignalSeverity.Low,
  scopes: [RiskSignalAttribute.phoneNumber, RiskSignalAttribute.dob],
  timestamp: '2022-10-24T21:56:12.682238Z',
};

export const withRiskSignalDetails = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals/sig_ryxauTlDX8hIm3wVRmm',
    response: riskSignalDetailsFixture,
  });

export const withRiskSignalDetailsError = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals/sig_ryxauTlDX8hIm3wVRmm',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
