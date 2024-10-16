import type { SentilinkReasonCode } from '@onefootprint/types';

const sortReasonCodes = (reasonCodes: SentilinkReasonCode[]) => {
  return reasonCodes.sort((a, b) => Number(a.rank) - Number(b.rank));
};

export default sortReasonCodes;
