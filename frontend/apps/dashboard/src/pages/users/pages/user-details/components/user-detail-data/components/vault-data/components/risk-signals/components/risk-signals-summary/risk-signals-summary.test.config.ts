import { faker } from '@faker-js/faker';
import {
  RiskSignal,
  RiskSignalSeverity,
  SignalAttribute,
} from '@onefootprint/types';

const createRiskSignal = ({
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

export default createRiskSignal;
