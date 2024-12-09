import type { SentilinkReasonCode } from '@onefootprint/request-types/dashboard';

export const sortReasonCodes = (reasonCodes: SentilinkReasonCode[]) => {
  return reasonCodes.sort((a, b) => Number(a.rank) - Number(b.rank));
};
