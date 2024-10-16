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
