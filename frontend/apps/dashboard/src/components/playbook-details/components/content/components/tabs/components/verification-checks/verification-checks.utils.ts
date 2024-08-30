import type { AmlCheck, KybCheck, KycCheck, VerificationCheck } from '@onefootprint/types';

export const isKybCheck = (check: VerificationCheck): check is KybCheck => {
  return check.kind === 'kyb';
};

export const isKycCheck = (check: VerificationCheck): check is KycCheck => {
  return check.kind === 'kyc';
};

export const isAmlCheck = (check: VerificationCheck): check is AmlCheck => {
  return check.kind === 'aml';
};
