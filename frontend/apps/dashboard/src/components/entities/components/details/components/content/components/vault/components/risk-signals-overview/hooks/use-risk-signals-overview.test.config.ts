import { faker } from '@faker-js/faker';
import { mockRequest } from '@onefootprint/test-utils';
import type { RiskSignal, RiskSignalAttribute, RiskSignalSeverity } from '@onefootprint/types';

export const createRiskSignal = ({
  severity,
  scopes,
}: {
  severity: RiskSignalSeverity;
  scopes: RiskSignalAttribute[];
}): RiskSignal => ({
  id: faker.datatype.uuid(),
  severity,
  scopes,
  reasonCode: 'phone_number_located_is_voip',
  note: 'VOIP phone number',
  description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
  onboardingDecisionId: faker.datatype.uuid(),
  timestamp: '2022-10-24T21:56:12.682238Z',
  hasAmlHits: false,
});

export const withRiskSignals = (response: RiskSignal[]) =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals',
    response,
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
