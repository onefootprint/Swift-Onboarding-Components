import { faker } from '@faker-js/faker';
import type { RiskSignal, RiskSignalSeverity } from '@onefootprint/types';
import { RiskSignalAttribute } from '@onefootprint/types';

const createRiskSignal = (severity: RiskSignalSeverity): RiskSignal => ({
  id: faker.datatype.uuid(),
  severity,
  scopes: [RiskSignalAttribute.name],
  reasonCode: 'phone_number_located_is_voip',
  note: 'VOIP phone number',
  description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
  onboardingDecisionId: faker.datatype.uuid(),
  timestamp: '2022-10-24T21:56:12.682238Z',
  hasAmlHits: false,
});

export default createRiskSignal;
