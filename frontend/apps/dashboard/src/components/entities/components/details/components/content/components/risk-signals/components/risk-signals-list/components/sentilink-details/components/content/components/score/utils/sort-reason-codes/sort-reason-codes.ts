import { SentilinkFraudLevel, type SentilinkReasonCode } from '@onefootprint/types';

export const sortReasonCodes = (reasonCodes: SentilinkReasonCode[]) => {
  return reasonCodes.sort((a, b) => Number(a.rank) - Number(b.rank));
};

export const getMoreFraudyReasonCodes = (reasonCodes: SentilinkReasonCode[]) => {
  const filtered = reasonCodes.filter(reasonCode => reasonCode.direction === SentilinkFraudLevel.moreFraudy);
  const sorted = sortReasonCodes(filtered);
  return sorted;
};

export const getLessFraudyReasonCodes = (reasonCodes: SentilinkReasonCode[]) => {
  const filtered = reasonCodes.filter(reasonCode => reasonCode.direction === SentilinkFraudLevel.lessFraudy);
  const sorted = sortReasonCodes(filtered);
  return sorted;
};
