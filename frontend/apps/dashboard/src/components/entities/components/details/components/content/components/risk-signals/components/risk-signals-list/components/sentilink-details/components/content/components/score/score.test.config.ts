import { getSentilinkReasonCode } from '@onefootprint/fixtures/dashboard';
import type { SentilinkReasonCode } from '@onefootprint/request-types/dashboard';

export const reasonCodesFixture: SentilinkReasonCode[] = [
  getSentilinkReasonCode({
    code: 'ssn_tied_to_clump',
    direction: 'more_fraudy',
    explanation: 'Whether the SSN is tied to a clump of SSNs empirically used for fraud',
    rank: 1,
  }),
  getSentilinkReasonCode({
    code: 'ssn_dob',
    direction: 'more_fraudy',
    explanation: "Whether the supplied SSN aligns with the consumer's DOB",
    rank: 2,
  }),
  getSentilinkReasonCode({
    code: 'name_ssn_nonsense',
    direction: 'less_fraudy',
    explanation: 'Whether the supplied name or SSN is nonsense',
    rank: 3,
  }),
];
