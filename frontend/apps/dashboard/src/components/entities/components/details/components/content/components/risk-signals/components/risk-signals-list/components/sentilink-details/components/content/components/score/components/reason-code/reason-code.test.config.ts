import { getSentilinkReasonCode } from '@onefootprint/fixtures/dashboard';
import type { SentilinkReasonCode } from '@onefootprint/request-types/dashboard';

export const reasonCodesFixture: SentilinkReasonCode = getSentilinkReasonCode({
  code: 'ssn_tied_to_clump',
  direction: 'more_fraudy',
  explanation: 'Whether the SSN is tied to a clump of SSNs empirically used for fraud',
  rank: 1,
});
