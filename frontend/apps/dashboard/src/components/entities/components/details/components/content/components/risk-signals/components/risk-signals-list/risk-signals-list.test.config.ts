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
  {
    id: 'sig_sentilink123',
    onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    reasonCode: 'sentilink_synthetic_identity_medium_risk',
    note: 'Sentilink synthetic identity risk',
    description: 'The identity information provided has been flagged as potentially synthetic by Sentilink.',
    severity: RiskSignalSeverity.Medium,
    scopes: [RiskSignalAttribute.dob],
    timestamp: '2022-10-24T22:00:00.000000Z',
    hasAmlHits: false,
  },
];

export const withRiskSignalDetails = () => {
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals/sig_ryxauTlDX8hIm3wVRmm',
    response: riskSignalsFixture[0],
  });

  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals/sig_sentilink123',
    response: riskSignalsFixture[2],
  });
};

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
      message: 'Something went wrong',
    },
  });

export const withSentilinkRiskSignal = () =>
  mockRequest({
    method: 'post',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/sentilink/sig_sentilink123',
    response: {
      idTheft: {
        reasonCodes: [
          {
            code: 'ID_THEFT_CODE_1',
            direction: 'positive',
            explanation: 'Explanation for ID theft code 1',
            rank: 1,
          },
          {
            code: 'ID_THEFT_CODE_2',
            direction: 'negative',
            explanation: 'Explanation for ID theft code 2',
            rank: 2,
          },
        ],
        score: 75,
      },
      synthetic: {
        reasonCodes: [
          {
            code: 'SYNTHETIC_CODE_1',
            direction: 'positive',
            explanation: 'Explanation for synthetic code 1',
            rank: 1,
          },
          {
            code: 'SYNTHETIC_CODE_2',
            direction: 'negative',
            explanation: 'Explanation for synthetic code 2',
            rank: 2,
          },
        ],
        score: 60,
      },
    },
  });
