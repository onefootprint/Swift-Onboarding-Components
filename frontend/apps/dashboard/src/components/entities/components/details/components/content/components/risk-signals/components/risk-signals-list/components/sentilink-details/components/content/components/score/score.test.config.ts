import { SentilinkFraudLevel, type SentilinkReasonCode } from '@onefootprint/types';

export const reasonCodesFixture: SentilinkReasonCode[] = [
  {
    code: 'ssn_tied_to_clump',
    direction: SentilinkFraudLevel.moreFraudy,
    explanation: 'Whether the SSN is tied to a clump of SSNs empirically used for fraud',
    rank: 1,
  },
  {
    code: 'ssn_dob',
    direction: SentilinkFraudLevel.moreFraudy,
    explanation: "Whether the supplied SSN aligns with the consumer's DOB",
    rank: 2,
  },
  {
    code: 'name_ssn_nonsense',
    direction: SentilinkFraudLevel.lessFraudy,
    explanation: 'Whether the supplied name or SSN is nonsense',
    rank: 3,
  },
];

export const mixedReasonCodesFixture: SentilinkReasonCode[] = [
  { code: 'LESS_1', explanation: 'Less fraudy 1', direction: SentilinkFraudLevel.lessFraudy, rank: 1 },
  { code: 'LESS_2', explanation: 'Less fraudy 2', direction: SentilinkFraudLevel.lessFraudy, rank: 2 },
  { code: 'MORE_1', explanation: 'More fraudy 1', direction: SentilinkFraudLevel.moreFraudy, rank: 3 },
  { code: 'MORE_2', explanation: 'More fraudy 2', direction: SentilinkFraudLevel.moreFraudy, rank: 4 },
];

export const lessFraudyReasonCodesFixture: SentilinkReasonCode[] = [
  { code: 'LESS_1', explanation: 'Less fraudy 1', direction: SentilinkFraudLevel.lessFraudy, rank: 1 },
  { code: 'LESS_2', explanation: 'Less fraudy 2', direction: SentilinkFraudLevel.lessFraudy, rank: 2 },
  { code: 'LESS_3', explanation: 'Less fraudy 3', direction: SentilinkFraudLevel.lessFraudy, rank: 3 },
];

export const moreFraudyReasonCodesFixture: SentilinkReasonCode[] = [
  { code: 'MORE_1', explanation: 'More fraudy 1', direction: SentilinkFraudLevel.moreFraudy, rank: 1 },
  { code: 'MORE_2', explanation: 'More fraudy 2', direction: SentilinkFraudLevel.moreFraudy, rank: 2 },
  { code: 'MORE_3', explanation: 'More fraudy 3', direction: SentilinkFraudLevel.moreFraudy, rank: 3 },
];
