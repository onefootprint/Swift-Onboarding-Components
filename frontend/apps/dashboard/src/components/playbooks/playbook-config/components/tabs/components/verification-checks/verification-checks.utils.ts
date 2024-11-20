import type { VerificationCheck } from '@onefootprint/request-types/dashboard';

type KybCheck = Extract<VerificationCheck, { kind: 'kyb' }>;

type KycCheck = Extract<VerificationCheck, { kind: 'kyc' }>;

type BusinessAmlCheck = Extract<VerificationCheck, { kind: 'business_aml' }>;

type AmlCheck = Extract<VerificationCheck, { kind: 'aml' }>;

type NeuroCheck = Extract<VerificationCheck, { kind: 'neuro_id' }>;

type SentilinkCheck = Extract<VerificationCheck, { kind: 'sentilink' }>;

export const isKybCheck = (check: VerificationCheck): check is KybCheck => {
  return check.kind === 'kyb';
};

export const isKycCheck = (check: VerificationCheck): check is KycCheck => {
  return check.kind === 'kyc';
};

export const isBusinessAml = (check: VerificationCheck): check is BusinessAmlCheck => {
  return check.kind === 'business_aml';
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
