import { mockRequest } from '@onefootprint/test-utils';
import {
  RiskSignal,
  RiskSignalSeverity,
  SignalAttribute,
} from '@onefootprint/types';

export const riskSignalsFixture: RiskSignal[] = [
  {
    id: 'sig_ryxauTlDX8hIm3wVRmm',
    severity: RiskSignalSeverity.Low,
    scopes: [SignalAttribute.phoneNumber],
    reasonCode: 'mobile_number',
    description:
      "The consumer's phone number is possibly a wireless mobile number.",
    deactivatedAt: null,
    onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    vendors: ['idology'],
    timestamp: '2022-10-24T21:56:12.682238Z',
  },
  {
    id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
    onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    reasonCode: 'corporate_email_domain',
    description:
      'Indicates that the domain of the email address has been identified as belonging to a corporate entity.',
    severity: RiskSignalSeverity.Low,
    scopes: [SignalAttribute.email],
    timestamp: '2022-10-24T21:56:12.682238Z',
    deactivatedAt: null,
    vendors: ['idology'],
  },
];

export const withRiskSignals = () =>
  mockRequest({
    method: 'get',
    path: '/users/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals',
    response: riskSignalsFixture,
  });
