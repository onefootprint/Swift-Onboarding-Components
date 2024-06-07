import { faker } from '@faker-js/faker';
import type { RiskSignal, RiskSignalAttribute } from '@onefootprint/types';
import { RiskSignalSeverity } from '@onefootprint/types';

const createRiskSignal = (scopes: RiskSignalAttribute[]): RiskSignal => ({
  id: faker.datatype.uuid(),
  severity: RiskSignalSeverity.Low,
  scopes,
  reasonCode: 'phone_number_located_is_voip',
  note: 'VOIP phone number',
  description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
  onboardingDecisionId: faker.datatype.uuid(),
  timestamp: '2022-10-24T21:56:12.682238Z',
  hasAmlHits: false,
});

export default createRiskSignal;
