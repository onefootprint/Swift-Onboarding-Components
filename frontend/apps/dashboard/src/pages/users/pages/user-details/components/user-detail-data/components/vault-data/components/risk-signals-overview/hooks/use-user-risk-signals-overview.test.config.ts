import { faker } from '@faker-js/faker';
import { mockRequest } from '@onefootprint/test-utils';
import {
  RiskSignal,
  RiskSignalSeverity,
  SignalAttribute,
} from '@onefootprint/types';

export const createRiskSignal = ({
  severity,
  scopes,
}: {
  severity: RiskSignalSeverity;
  scopes: SignalAttribute[];
}): RiskSignal => ({
  id: faker.datatype.uuid(),
  severity,
  scopes,
  reasonCode: 'mobile_number',
  description:
    "The consumer's phone number is possibly a wireless mobile number.",
  deactivatedAt: null,
  onboardingDecisionId: faker.datatype.uuid(),
  vendors: ['idology'],
  timestamp: '2022-10-24T21:56:12.682238Z',
});

export const withRiskSignals = (response: RiskSignal[]) =>
  mockRequest({
    method: 'get',
    path: '/users/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals',
    response,
  });

export const withRiskSignalsError = () =>
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
