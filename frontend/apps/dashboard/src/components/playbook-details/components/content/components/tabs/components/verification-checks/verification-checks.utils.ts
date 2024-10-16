import type { AmlCheck, KybCheck, KycCheck, NeuroCheck, SentilinkCheck, VerificationCheck } from '@onefootprint/types';

export const isKybCheck = (check: VerificationCheck): check is KybCheck => {
  return check.kind === 'kyb';
};

export const isKycCheck = (check: VerificationCheck): check is KycCheck => {
  return check.kind === 'kyc';
};

export const isAmlCheck = (check: VerificationCheck): check is AmlCheck => {
  return check.kind === 'aml';
};

export const isNeuroCheck = (check: VerificationCheck): check is NeuroCheck => {
  return check.kind === 'neuro_id';
};

export const isSentilinkCheck = (check: VerificationCheck): check is SentilinkCheck => {
  return check.kind === 'sentilink';
};
