import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import type { KycData } from '@/types';

export const getSsnKind = (requirement: CollectKycDataRequirement) => {
  const { missingAttributes, optionalAttributes, populatedAttributes } = requirement;
  let ssnKind: 'last-4' | 'ssn-full' | undefined;

  if (
    missingAttributes.includes(CollectedKycDataOption.ssn9) ||
    optionalAttributes.includes(CollectedKycDataOption.ssn9) ||
    populatedAttributes.includes(CollectedKycDataOption.ssn9)
  ) {
    ssnKind = 'ssn-full';
  } else if (
    missingAttributes.includes(CollectedKycDataOption.ssn4) ||
    optionalAttributes.includes(CollectedKycDataOption.ssn4) ||
    populatedAttributes.includes(CollectedKycDataOption.ssn4)
  ) {
    ssnKind = 'last-4';
  }

  return ssnKind;
};

export const getSsnValue = (data: KycData, ssnKind?: 'last-4' | 'ssn-full') => {
  if (ssnKind === 'last-4') {
    return data[IdDI.ssn4];
  }
  if (ssnKind === 'ssn-full') {
    return data[IdDI.ssn9];
  }
  return undefined;
};

export const ssnFormatter = (ssnKind: 'ssn-full' | 'last-4', ssn?: string, scrubbed?: boolean) => {
  if (scrubbed) {
    const len = ssnKind === 'ssn-full' ? 9 : 4;
    return '•'.repeat(len);
  }
  if (!ssn) {
    return '';
  }
  return ssn.replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3');
};
