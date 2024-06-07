import { mockRequest } from '@onefootprint/test-utils';
import type { RiskSignal } from '@onefootprint/types';
import { RiskSignalAttribute, RiskSignalSeverity } from '@onefootprint/types';

export const riskSignalsFixture: RiskSignal[] = [
  {
    id: 'sig_ryxauTlDX8hIm3wVRmm',
    severity: RiskSignalSeverity.Low,
    scopes: [RiskSignalAttribute.phoneNumber],
    reasonCode: 'phone_number_located_is_voip',
    note: 'VOIP phone number',
    description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
    onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    timestamp: '2022-10-24T21:56:12.682238Z',
    hasAmlHits: false,
  },
  {
    id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
    onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    reasonCode: 'email_domain_corporate',
    note: 'Corporate email domain',
    description: 'The domain of the email address has been identified as belonging to a corporate entity.',
    severity: RiskSignalSeverity.Low,
    scopes: [RiskSignalAttribute.email],
    timestamp: '2022-10-24T21:56:12.682238Z',
    hasAmlHits: false,
  },
];

export const withRiskSignals = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals',
    response: riskSignalsFixture,
  });

export const withRiskSignalsError = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
