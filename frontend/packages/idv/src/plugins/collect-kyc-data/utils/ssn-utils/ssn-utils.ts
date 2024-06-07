import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import type { KycData } from '../data-types';

export const getSsnKind = (requirement: CollectKycDataRequirement) => {
  const { missingAttributes, optionalAttributes, populatedAttributes } = requirement;
  let ssnKind: 'ssn4' | 'ssn9' | undefined;

  if (
    missingAttributes.includes(CollectedKycDataOption.ssn9) ||
    optionalAttributes.includes(CollectedKycDataOption.ssn9) ||
    populatedAttributes.includes(CollectedKycDataOption.ssn9)
  ) {
    ssnKind = 'ssn9';
  } else if (
    missingAttributes.includes(CollectedKycDataOption.ssn4) ||
    optionalAttributes.includes(CollectedKycDataOption.ssn4) ||
    populatedAttributes.includes(CollectedKycDataOption.ssn4)
  ) {
    ssnKind = 'ssn4';
  }

  return ssnKind;
};

export const getSsnValue = (data: KycData, ssnKind?: 'ssn4' | 'ssn9') => {
  if (ssnKind === 'ssn4') {
    return data[IdDI.ssn4];
  }
  if (ssnKind === 'ssn9') {
    return data[IdDI.ssn9];
  }
  return undefined;
};

export const ssnFormatter = (ssnKind: 'ssn4' | 'ssn9', ssn?: string, scrubbed?: boolean) => {
  if (scrubbed) {
    const len = ssnKind === 'ssn9' ? 9 : 4;
    return '•'.repeat(len);
  }
  if (!ssn) {
    return '';
  }
  return ssn.replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3');
};
