import { SentilinkFraudLevel, type SentilinkReasonCode } from '@onefootprint/types';

export const reasonCodesFixture: SentilinkReasonCode = {
  code: 'ssn_tied_to_clump',
  direction: SentilinkFraudLevel.moreFraudy,
  explanation: 'Whether the SSN is tied to a clump of SSNs empirically used for fraud',
  rank: 1,
};
