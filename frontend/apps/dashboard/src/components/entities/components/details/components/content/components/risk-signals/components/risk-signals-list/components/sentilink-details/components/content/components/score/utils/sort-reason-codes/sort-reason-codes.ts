import type { SentilinkReasonCode } from '@onefootprint/types';

export const sortReasonCodes = (reasonCodes: SentilinkReasonCode[]) => {
  return reasonCodes.sort((a, b) => Number(a.rank) - Number(b.rank));
};
