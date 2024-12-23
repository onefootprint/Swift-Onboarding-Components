import { SentilinkFraudLevel, type SentilinkReasonCode } from '@onefootprint/types';

const reasonCode1: SentilinkReasonCode = {
  code: 'ssn_tied_to_clump',
  direction: SentilinkFraudLevel.moreFraudy,
  explanation: 'Whether the SSN is tied to a clump of SSNs empirically used for fraud',
  rank: 1,
};

const reasonCode2: SentilinkReasonCode = {
  code: 'ssn_dob',
  direction: SentilinkFraudLevel.moreFraudy,
  explanation: "Whether the supplied SSN aligns with the consumer's DOB",
  rank: 2,
};

const reasonCode3: SentilinkReasonCode = {
  code: 'name_ssn_nonsense',
  direction: SentilinkFraudLevel.lessFraudy,
  explanation: 'Whether the supplied name or SSN is nonsense',
  rank: 3,
};

const sortedReasonCodesFixture: SentilinkReasonCode[] = [reasonCode1, reasonCode2, reasonCode3];
const outOfOrderReasonCodesFixture: SentilinkReasonCode[] = [reasonCode3, reasonCode1, reasonCode2];
const singleReasonCodeFixture: SentilinkReasonCode[] = [reasonCode1];

export { sortedReasonCodesFixture, outOfOrderReasonCodesFixture, singleReasonCodeFixture };
